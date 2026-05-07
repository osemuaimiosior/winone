package simulation

import (
	"github.com/go-chi/chi"

	middlware "api-gateway/middleware"
)

func SimulationJobRequestRoutes(r chi.Router) {
	r.Use(middlware.Authorization)

	r.Get("/options-pricing", MonteCarloOptionsPricing)
	// r.Post("/options-pricing", controllers.CreateOptionsJob)
}
