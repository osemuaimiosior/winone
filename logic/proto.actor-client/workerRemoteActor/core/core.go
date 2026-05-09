package core

import (
	"github.com/asynkron/protoactor-go/actor"
)

func CoreSystem() *actor.ActorSystem {
	system := actor.NewActorSystem()
	return system
}