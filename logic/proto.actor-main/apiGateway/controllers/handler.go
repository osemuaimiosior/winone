package controllers

import (
	// "fmt"

	simulation "winone-hpc/apiGateway/controllers/simulation"

	"github.com/go-chi/chi"
	chimiddle "github.com/go-chi/chi/middleware"
)

func Handler(r *chi.Mux) {

	//Global middleware
	r.Use(chimiddle.StripSlashes)

	r.Route("/app/v1", func(router chi.Router) { simulation.SimulationJobRequestRoutes(router) })
}
