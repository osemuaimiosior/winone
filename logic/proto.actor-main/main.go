package main

import (
	"fmt"
	// "log"
	"os"
	// "strconv"
	// "crypto/tls"
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
	////////////////////////////////////////////////// Tailscale setup stop /////////////////////////////////////////////////

	system := core.CoreSystem()

	masterActorName := os.Getenv("MASTER_ACTOR")

	config := remote.Configure(
		"0.0.0.0",
		8090,
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
