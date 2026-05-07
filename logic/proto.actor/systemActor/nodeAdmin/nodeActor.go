package actors

import (
	"fmt"
	message "winone-hpc/message"

	// core "wineone-hpc/core"
	"github.com/asynkron/protoactor-go/actor"
)

// Define an actor type by implementing actor.Actor interface.
// Key Responsibilities include: Accept jobs, Split jobs into tasks ,Assign tasks to workers ,Track node availability ,Handle failures
type MasterNodeActor struct{}

// type SystemAdministratorActor struct{}

// Receive is called for each incoming message to the master actor
func (g *MasterNodeActor) Receive(ctx actor.Context) {
	switch msg := ctx.Message().(type) {

	case *message.StartMessage:
		fmt.Printf("Received: %+v\n", msg)

		ctx.Respond(&message.StartResponse{
			Message: "confirmed...starting system master node actor",
		})

	case *message.NewJobRequest:
		fmt.Printf("Received: %+v\n", msg)

		ctx.Respond(&message.StartResponse{
			Message: "confirmed",
		})
	}
}
