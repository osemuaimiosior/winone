package main

import (
	"fmt"
	// "log"
	"os"
	// "strconv"
	"crypto/tls"
	"flag"
	"html"
	"strings"
	"time"

	"github.com/joho/godotenv"

	core "winone-hpc/core"
	message "winone-hpc/message"
	actors "winone-hpc/systemActor/nodeAdmin"

	"context"

	"github.com/asynkron/protoactor-go/actor"
	remote "github.com/asynkron/protoactor-go/remote"

	"net/http"
	"winone-hpc/db"

	"tailscale.com/tsnet"

	handlers "winone-hpc/clientActor/apiGateway/controllers"

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

	////////////////////////////////////////////////// Tailscale setup stop /////////////////////////////////////////////////

	system := core.CoreSystem()

	masterActorName := os.Getenv("MASTER_ACTOR")
	adIP := status.Self.TailscaleIPs[0]

	//ONE remote config
	// config := remote.Configure(host, port)
	config := remote.Configure("0.0.0.0", 8090, remote.WithAdvertisedHost(adIP.String()))
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
