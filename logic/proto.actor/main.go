package main

import (
	"fmt"
	// "log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"

	core "winone-hpc/core"
	message "winone-hpc/message"
	actors "winone-hpc/systemActor/nodeAdmin"

	"github.com/asynkron/protoactor-go/actor"
	remote "github.com/asynkron/protoactor-go/remote"

	"net/http"
	"winone-hpc/db"

	handlers "winone-hpc/clientActor/apiGateway/controllers"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	log "github.com/sirupsen/logrus"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}
}

func main() {

	err := db.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}

	db.InitDB()

	system := core.CoreSystem()
	host := os.Getenv("MASTER_HOST")
	portStr := os.Getenv("MASTER_PORT")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 8090 // fallback default
	}
	fmt.Println(port)
	fmt.Println(host)

	masterActorName := os.Getenv("MASTER_ACTOR")

	//ONE remote config
	// config := remote.Configure(host, port)
	config := remote.Configure("0.0.0.0", 8090, remote.WithAdvertisedHost("100.79.54.6"))
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

	select {}
}
