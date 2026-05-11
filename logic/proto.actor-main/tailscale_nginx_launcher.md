# Go Program to Run Tailscale + NGINX on a Client PC

This project creates a Go program that:

1. Checks that Docker is installed.
2. Creates a `docker-compose.yml` file.
3. Creates a persistent Tailscale state directory.
4. Starts:
   - `tailscale/tailscale`
   - `nginx`
5. Shares the same network stack so NGINX is reachable over Tailscale.

---

## Project Structure

```text
client-deployer/
├── main.go
└── docker-compose.yml.template
```

---

## main.go

```go
package main

import (
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "strings"
)

const composeTemplate = `services:
  tailscale:
    image: tailscale/tailscale:latest
    hostname: tailscale-nginx
    environment:
      - TS_AUTHKEY=%s
      - TS_EXTRA_ARGS=--advertise-tags=tag:container
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=false
    volumes:
      - ./tailscale-nginx/state:/var/lib/tailscale
    devices:
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - net_admin
      - net_raw
    restart: unless-stopped

  nginx:
    image: nginx:latest
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
```

---

## Build the Program

```bash
go build -o client-deployer main.go
```

---

## Get a Tailscale Auth Key

1. Open the Tailscale admin console:
   https://login.tailscale.com/admin/settings/keys
2. Create an auth key.
3. Copy the key (looks like `tskey-xxxxxxxx`).

---

## Run the Program

### Linux/macOS

```bash
export TS_AUTHKEY=tskey-your-auth-key
./client-deployer
```

### Windows PowerShell

```powershell
$env:TS_AUTHKEY="tskey-your-auth-key"
.\client-deployer.exe
```

---

## Verify

Check container status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Get the Tailscale IP:

```bash
docker exec tailscale-nginx-tailscale-1 tailscale ip -4
```

Open NGINX in a browser:

```text
http://<tailscale-ip>
```

---

## Stop Services

```bash
docker compose down
```

---

## Customizing for Your Worker Image

Replace the `nginx` service in the template with your own Docker image:

```yaml
  worker:
    image: osemu/winone-hpc-worker
    depends_on:
      - tailscale
    network_mode: service:tailscale
    restart: unless-stopped
```

Then your worker will automatically join your Tailscale network.

---

## Recommended Production Use

For your distributed system:

- EC2 master runs in AWS and also joins Tailscale.
- Each client PC runs this program.
- Each client container shares the Tailscale network namespace.
- Your worker connects to the master using the master's Tailscale IP.

This avoids:

- Public IP management
- Port forwarding
- NAT issues
- CGNAT restrictions

