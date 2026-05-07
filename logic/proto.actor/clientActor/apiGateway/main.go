package main

import (
	// "log"

	"github.com/joho/godotenv"

	"api-gateway/db"
	"fmt"
	"net/http"

	handlers "api-gateway/controllers"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	log "github.com/sirupsen/logrus"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env")
	}

	err = db.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}

	db.InitDB()

	log.SetReportCaller(true)
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	handlers.Handler(r)

	fmt.Println("Starting system API...")

	serverErr := http.ListenAndServe("localhost:8000", r)
	if serverErr != nil {
		log.Error(err)
	}

	select {}
}
