package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"

	core "winone-hpc/core"
	"winone-hpc/message"
	actors "winone-hpc/systemActor/nodeAdmin"

	"github.com/asynkron/protoactor-go/actor"
	remote "github.com/asynkron/protoactor-go/remote"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}
}

func main() {
	system := core.CoreSystem()
	host := os.Getenv("MASTER_HOST")
	portStr := os.Getenv("MASTER_PORT")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 8090 // fallback default
	}

	masterActorName := os.Getenv("MASTER_ACTOR")

	//ONE remote config
	config := remote.Configure(host, port)
	r := remote.NewRemote(system, config)
	r.Start()

	// Spawn MasterNodeActor
	masterProps := actor.PropsFromProducer(func() actor.Actor {
		return &actors.MasterNodeActor{}
	})
	masterPID, _ := system.Root.SpawnNamed(masterProps, masterActorName)

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

	fmt.Printf("Got response: %v\n", result1)

	// fmt.Println("MasterNodeActor:", masterPID)
	// fmt.Println("Running on 127.0.0.1:8090")

	select {}
}
