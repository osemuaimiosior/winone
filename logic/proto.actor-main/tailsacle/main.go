package main

import (
	"fmt"
	// "log"
	"os"
	// "strconv"
	"crypto/tls"
	"flag"

	// "html"
	"strings"
	"time"

	"github.com/joho/godotenv"

	core "winone-hpc/core"
	message "winone-hpc/server/message"
	actors "winone-hpc/systemActor/nodeAdmin"

	"context"

	"github.com/asynkron/protoactor-go/actor"
	remote "github.com/asynkron/protoactor-go/remote"

	"net/http"
	"winone-hpc/db"

	"tailscale.com/ipn/ipnstate"
	"tailscale.com/tsnet"

	handlers "winone-hpc/apiGateway/controllers"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	log "github.com/sirupsen/logrus"
)

var (
	addr = flag.String("addr", ":80", "address to listen on")
)

func main() {

	err1 := godotenv.Load()
	if err1 != nil {
		log.Println("No .env file found")
	}

	err := db.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}

	db.InitDB()

	///////////////////////////////////////////////////////// Tailscale setup start ////////////////////////////////////////////////

	flag.Parse()

	// Read auth key
	authKey := os.Getenv("TS_AUTHKEY")
	if authKey == "" {
		log.Fatal("TS_AUTHKEY is not set")
	}

	machineName := os.Getenv("MACHINE_NAME")
	if machineName == "" {
		log.Fatal("MACHINE_NAME is not set")
	}

	nodeName := flag.String("hostname", machineName, "Tailscale machine name")

	// Allow hostname override from environment
	if envName := os.Getenv("TS_HOSTNAME"); envName != "" {
		*nodeName = envName
	}

	// Create tsnet server
	srv := &tsnet.Server{
		AuthKey:  authKey,
		Hostname: *nodeName, // Custom machine name in Tailscale
		// Dir:      "./tsnet-data", // Persist identity locally
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

	// Wait until Tailscale has completed login and received an IP address.
	var status *ipnstate.Status

	for {
		status, err = lc.StatusWithoutPeers(context.Background())
		if err == nil &&
			status != nil &&
			status.Self != nil &&
			len(status.Self.TailscaleIPs) > 0 &&
			status.Self.DNSName != "" {
			break
		}

		log.Println("Waiting for Tailscale to finish login and obtain an IP address...")
		time.Sleep(2 * time.Second)
	}

	// Print machine information
	fmt.Println("===================================")
	fmt.Println("Backend State:", status.BackendState)
	fmt.Println("Your Machine Name:", firstLabel(status.Self.DNSName))
	fmt.Println("Your Full DNS Name:", status.Self.DNSName)
	fmt.Println("Your Machine IPv4:", status.Self.TailscaleIPs[0])
	fmt.Println("All Tailscale IPs:", status.Self.TailscaleIPs)
	fmt.Println("===================================")

	// HTTPS support if listening on 443
	if *addr == ":443" {
		ln = tls.NewListener(ln, &tls.Config{
			GetCertificate: lc.GetCertificate,
		})
	}

	////////////////////////////////////////////////// Tailscale setup stop /////////////////////////////////////////////////

	system := core.CoreSystem()

	masterActorName := os.Getenv("MASTER_ACTOR")
	adIP := status.Self.TailscaleIPs[0]
	advertisedAddress := fmt.Sprintf("%s:%d", adIP.String(), 8090)

	// config := remote.Configure(
	// 	"0.0.0.0",
	// 	8090,
	// )
	config := remote.Configure(
		"0.0.0.0",
		8090,
		remote.WithAdvertisedHost(advertisedAddress),
	)

	remoteActor := remote.NewRemote(system, config)
	remoteActor.Start()

	// Spawn MasterNodeActor
	masterProps := actor.PropsFromProducer(func() actor.Actor {
		return &actors.MasterNodeActor{}
	})

	masterPID, err := system.Root.SpawnNamed(masterProps, masterActorName)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(masterPID.Address)
	fmt.Println(masterPID)

	now := time.Now().Unix()

	// Send ping and wait for reply using RequestFuture
	future1 := system.Root.RequestFuture(masterPID, &message.StartMessage{
		StartUpNodeCount: 3,
		StartDateUnix:    now,
	}, 5*time.Second)

	result1, err := future1.Result() // wait for response or timeout
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	log.SetReportCaller(true)
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	handlers.Handler(r)

	fmt.Println("Starting system API on port :8000...")

	serverErr := http.ListenAndServe("0.0.0.0:8000", r)
	fmt.Println("API started...")
	if serverErr != nil {
		log.Error(serverErr)
	}

	fmt.Printf("Got response: %v\n", result1)

	// fmt.Println("MasterNodeActor:", masterPID)
	// fmt.Println("Running on 127.0.0.1:8090")
}

func firstLabel(s string) string {
	s, _, _ = strings.Cut(s, ".")
	return s
}

// Simple context helper
func mainContext() context.Context {
	return context.Background()
}
