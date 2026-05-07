package db

import (
	"context"

	log "github.com/sirupsen/logrus"
)

func InitDB() {

	log.SetFormatter(&log.TextFormatter{
		FullTimestamp: true,
		ForceColors:   true,
	})

	createJobTableQuery := `
		CREATE TABLE IF NOT EXISTS jobs (
			id SERIAL PRIMARY KEY,
			job_name TEXT NOT NULL,
			status TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`
	createClientTableQuery := `
		CREATE TABLE IF NOT EXISTS clients (
			id SERIAL PRIMARY KEY,
			username TEXT NOT NULL,
			user_email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			auth_token TEXT,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`

	createWorkerNodeTableQuery := `
		CREATE TABLE IF NOT EXISTS worker_nodes (
			id SERIAL PRIMARY KEY,
			node_id TEXT UNIQUE NOT NULL,
			host TEXT NOT NULL,
			status TEXT NOT NULL,
			last_heartbeat TIMESTAMP
		);
	`

	createTaskTableQuery := `
		CREATE TABLE IF NOT EXISTS tasks (
			id SERIAL PRIMARY KEY,
			job_id INT REFERENCES jobs(id),
			node_id TEXT,
			status TEXT,
			result TEXT,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`

	_, createJobTable := DB.Exec(context.Background(), createJobTableQuery)

	if createJobTable != nil {
		log.Fatal(createJobTable)
	}

	log.WithFields(log.Fields{
		// "table": "jobs",
	}).Info("table initialized")

	_, createClientTableErr := DB.Exec(context.Background(), createClientTableQuery)

	if createClientTableErr != nil {
		log.Fatal(createClientTableErr)
	}

	log.WithFields(log.Fields{}).Info("clients initialized")

	_, createWorkerNodeTableErr := DB.Exec(context.Background(), createWorkerNodeTableQuery)

	if createWorkerNodeTableErr != nil {
		log.Fatal(createWorkerNodeTableErr)
	}

	log.WithFields(log.Fields{}).Info("worker nodes initialized")

	_, createTaskTableErr := DB.Exec(context.Background(), createTaskTableQuery)

	if createTaskTableErr != nil {
		log.Fatal(createTaskTableErr)
	}

	log.WithFields(log.Fields{}).Info("taks initialized")
}
