package middleware

import (
	"context"
	"errors"

	// "fmt"
	"net/http"

	"github.com/jackc/pgx/v5"

	"api-gateway/db"
	apiError "api-gateway/error"

	log "github.com/sirupsen/logrus"
)

var UnAuthorizedError = errors.New("Invalid auth token.")

func Authorization(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// var username string = r.URL.Query().Get("username") //for getting the /username?<some vale> from the api URL
		var token = r.Header.Get("Authorization")

		var err error

		if token == " " {
			log.Error(UnAuthorizedError)
			apiError.RequestErrorHandler(w, UnAuthorizedError)
			return
		}

		//Insert into database
		// query := `
		// 	INSERT INTO jobs(job_name, status)
		// 	VALUES($1, $2)
		// `

		// _, err := db.DB.Exec(
		// 	context.Background(),
		// 	query,
		// 	"MonteCarloSimulation",
		// 	"pending",
		// )

		// if err != nil {
		// 	log.Fatal(err)
		// }

		//Database query
		var id int
		var username string
		var email string

		err = db.DB.QueryRow(
			context.Background(),
			`
			SELECT id, username, user_email FROM clients WHERE auth_token = $1
			`,
			token,
		).Scan(&id, &username, &email)

		if err != nil {

			// No matching user
			if err == pgx.ErrNoRows {
				apiError.RequestErrorHandler(w, UnAuthorizedError)
				return
			}

			// Actual DB/server error
			apiError.InternalErrorHandler(w)
			return
		}

		next.ServeHTTP(w, r)
	})
}
