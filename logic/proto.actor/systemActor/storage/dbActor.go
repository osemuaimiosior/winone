package storage

import (
	"fmt"
	"winone-hpc/message"

	"github.com/asynkron/protoactor-go/actor"
)

// Define an actor type by implementing actor.Actor interface
type DatabaseActor struct{}

// Receive is called for each incoming message
func (g *DatabaseActor) Receive(ctx actor.Context) {
	switch msg := ctx.Message().(type) {
	case *message.StartMessage:
		fmt.Printf("Hello %s!\n", msg)
	}
}
