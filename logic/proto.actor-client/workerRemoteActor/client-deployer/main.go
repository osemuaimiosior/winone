package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const composeTemplate = `
services:
  tailscale:
    image: tailscale/tailscale:latest
    hostname: tailscale-winone-hpc-worker
    environment:
      - TS_AUTHKEY=%s
      - TS_EXTRA_ARGS=--advertise-tags=tag:container
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=false
    volumes:
      - ./tailscale-winone-hpc-worker/state:/var/lib/tailscale
    devices:
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - net_admin
      - net_raw
    restart: unless-stopped

  winone-hpc-worker:
    image: osemu/winone-hpc-worker:latest
    depends_on:
      - tailscale
    network_mode: service:tailscale
    restart: unless-stopped
`

func main() {
	authKey := os.Getenv("TS_AUTHKEY")
	if authKey == "" {
		fmt.Println("ERROR: TS_AUTHKEY environment variable is not set")
		fmt.Println("Example:")
		fmt.Println("  export TS_AUTHKEY=tskey-xxxxxxxx")
		fmt.Println("  go run main.go")
		os.Exit(1)
	}

	if err := checkDocker(); err != nil {
		fmt.Printf("Docker check failed: %v\n", err)
		os.Exit(1)
	}

	if err := createDirectories(); err != nil {
		fmt.Printf("Failed to create directories: %v\n", err)
		os.Exit(1)
	}

	if err := writeComposeFile(authKey); err != nil {
		fmt.Printf("Failed to write docker-compose.yml: %v\n", err)
		os.Exit(1)
	}

	if err := startServices(); err != nil {
		fmt.Printf("Failed to start services: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("\nServices started successfully.")
	fmt.Println("Use 'docker compose ps' to check status.")
	fmt.Println("Use 'docker compose logs -f' to view logs.")
	// fmt.Println("Use 'docker exec tailscale-nginx-tailscale-1 tailscale ip -4' to get the Tailscale IP.")
}

func checkDocker() error {
	if _, err := exec.LookPath("docker"); err != nil {
		return fmt.Errorf("docker is not installed or not in PATH")
	}

	cmd := exec.Command("docker", "info")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("docker daemon is not running or current user lacks permission")
	}

	return nil
}

func createDirectories() error {
	return os.MkdirAll(filepath.Join("tailscale-nginx", "state"), 0755)
}

func writeComposeFile(authKey string) error {
	content := fmt.Sprintf(composeTemplate, authKey)
	return os.WriteFile("docker-compose.yml", []byte(content), 0644)
}

func startServices() error {
	composeCmd := detectComposeCommand()

	parts := strings.Split(composeCmd, " ")
	args := append(parts[1:], "up", "-d")

	cmd := exec.Command(parts[0], args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func detectComposeCommand() string {
	if err := exec.Command("docker", "compose", "version").Run(); err == nil {
		return "docker compose"
	}

	if _, err := exec.LookPath("docker-compose"); err == nil {
		return "docker-compose"
	}

	fmt.Println("ERROR: Docker Compose not found.")
	os.Exit(1)
	return ""
}
