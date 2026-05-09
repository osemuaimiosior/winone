package main

import (
	"fmt"
	// "log"
	"os"
	// "strconv"
	"time"

	"github.com/joho/godotenv"

	core "winone-hpc-worker/core"
	message "winone-hpc-worker/message"

	// actors "winone-hpc-worker/systemActor/nodeAdmin"

	"github.com/asynkron/protoactor-go/actor"
	remote "github.com/asynkron/protoactor-go/remote"

	log "github.com/sirupsen/logrus"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}
}

func main() {

	masterHost := os.Getenv("MASTER_PID_HOST")
	if masterHost == "" {
		log.Fatal("MASTER_PID_HOST is not set")
	}

	fmt.Println(masterHost)

	system := core.CoreSystem()

	config := remote.Configure("0.0.0.0", 8091, remote.WithAdvertisedHost("100.118.239.105"))
	remoteActor := remote.NewRemote(system, config)
	remoteActor.Start()

	masterPID := actor.NewPID(masterHost, "MasterNodeActor")

	now := time.Now().Unix()

	// Send ping and wait for reply using RequestFuture
	future := system.Root.RequestFuture(masterPID, &message.StartMessage{
		StartUpNodeCount: 3,
		StartDateUnix:    now,
	}, 5*time.Second)

	result, err := future.Result() // wait for response or timeout
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	fmt.Printf("Got response: %v\n", result)

	// fmt.Println("Running on 127.0.0.1:8090")
}
