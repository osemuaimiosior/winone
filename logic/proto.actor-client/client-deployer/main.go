package main

import (
	"context"
	"crypto/tls"
	"flag"
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"tailscale.com/tsnet"
)

var (
	addr = flag.String("addr", ":80", "address to listen on")
)

func main() {
	// Load .env for local development
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	flag.Parse()

	// Read auth key
	authKey := os.Getenv("TS_AUTHKEY")
	if authKey == "" {
		log.Fatal("TS_AUTHKEY is not set")
	}

	machineName := os.Getenv("MACHINE_NAME")
	if machineName == "" {
		log.Fatal("TS_AUTHKEY is not set")
	}

	nodeName := flag.String("hostname", machineName, "Tailscale machine name")

	// Allow hostname override from environment
	if envName := os.Getenv("TS_HOSTNAME"); envName != "" {
		*nodeName = envName
	}

	// Create tsnet server
	srv := &tsnet.Server{
		AuthKey:  authKey,
		Hostname: *nodeName,      // Custom machine name in Tailscale
		Dir:      "./tsnet-data", // Persist identity locally
	}
	defer srv.Close()

	// Start listener (this also triggers login if needed)
	ln, err := srv.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()

	// Get local client
	lc, err := srv.LocalClient()
	if err != nil {
		log.Fatal(err)
	}

	// Print machine information
	status, err := lc.StatusWithoutPeers(mainContext())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("===================================")
	fmt.Println("Your Machine Name:", strings.Split(status.Self.DNSName, ".")[0])
	fmt.Println("Your Machine IPv4:", status.Self.TailscaleIPs[0])
	// fmt.Println("All Tailscale IPs:", status.Self.TailscaleIPs[0])
	fmt.Println("===================================")

	// HTTPS support if listening on 443
	if *addr == ":443" {
		ln = tls.NewListener(ln, &tls.Config{
			GetCertificate: lc.GetCertificate,
		})
	}

	// Start HTTP server
	log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "<html><body><h1>Hello, world!</h1>\n")
		fmt.Fprintf(w, "<p>You are <b>%s</b> from <b>%s</b> (%s)</p>",
			html.EscapeString(who.UserProfile.LoginName),
			html.EscapeString(firstLabel(who.Node.ComputedName)),
			r.RemoteAddr)
	})))

	///Start actor
}

func firstLabel(s string) string {
	s, _, _ = strings.Cut(s, ".")
	return s
}

// Simple context helper
func mainContext() context.Context {
	return context.Background()
}
