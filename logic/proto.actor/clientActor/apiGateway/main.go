package main

import (
	// "log"

	"github.com/joho/godotenv"

	"fmt"
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

	log.SetReportCaller(true)
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	handlers.Handler(r)

	fmt.Println("Starting system API on port :8000...")

	serverErr := http.ListenAndServe("localhost:8000", r)
	fmt.Println("API started...")
	if serverErr != nil {
		log.Error(serverErr)
	}
}
