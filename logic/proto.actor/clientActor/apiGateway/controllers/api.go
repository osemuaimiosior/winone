package handlers

import (
	// "fmt"

	simulation "api-gateway/controllers/simulation"

	"github.com/go-chi/chi"
	chimiddle "github.com/go-chi/chi/middleware"
)

func Handler(r *chi.Mux) {

	//Global middleware
	r.Use(chimiddle.StripSlashes)

	r.Route("/new-sim-job-request", func(router chi.Router) {

		simulation.SimulationJobRequestRoutes(router)
	})
}
