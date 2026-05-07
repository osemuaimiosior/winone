package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func ConnectDB() error {
	databaseURL := os.Getenv("POSTGRES_URL")

	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return err
	}

	err = pool.Ping(context.Background())
	if err != nil {
		return err
	}

	DB = pool

	fmt.Println("Connected to Neon PostgreSQL")

	return nil
}
