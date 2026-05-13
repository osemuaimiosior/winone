package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"log"
	"os"
	"time"

	pb "winone-hpc/server/controlpanel/message"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// loadTLSCredentials loads:
// - CA certificate to verify the server
// - Client certificate and key for mutual TLS
func loadTLSCredentials() (credentials.TransportCredentials, error) {
	// Load CA certificate
	caPEM, err := os.ReadFile("../certs/ca.crt")
	if err != nil {
		return nil, err
	}

	// Create cert pool and append CA
	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(caPEM) {
		log.Fatal("failed to append CA certificate")
	}

	// Load client certificate and private key
	clientCert, err := tls.LoadX509KeyPair(
		"../certs/client.crt",
		"../certs/client.key",
	)
	if err != nil {
		return nil, err
	}

	// Configure TLS
	tlsConfig := &tls.Config{
		RootCAs:      certPool,
		Certificates: []tls.Certificate{clientCert},

		// Must match the Common Name (CN) or SAN in server.crt.
		// If your certificate was created with CN=localhost, keep this as "localhost".
		// If you created it for an IP or DNS name, use that value instead.
		ServerName: "localhost",

		MinVersion: tls.VersionTLS12,
	}

	return credentials.NewTLS(tlsConfig), nil
}

func main() {
	// Load TLS credentials
	creds, err := loadTLSCredentials()
	if err != nil {
		log.Fatalf("failed to load TLS credentials: %v", err)
	}

	// Connect to gRPC server
	conn, err := grpc.NewClient(
		"localhost:50051",
		grpc.WithTransportCredentials(creds),
	)
	if err != nil {
		log.Fatalf("failed to connect to server: %v", err)
	}
	defer conn.Close()

	// Create client
	client := pb.NewControlpanelClient(conn)

	// Request timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Create request
	req := &pb.StartMessage{
		StartUpNodeCount: 1,
		StartDateUnix:    time.Now().Unix(),
	}

	// Call RPC
	resp, err := client.StartMsg(ctx, req)
	if err != nil {
		log.Fatalf("StartMsg RPC failed: %v", err)
	}

	log.Printf("Server response: %s", resp.Message)
}
