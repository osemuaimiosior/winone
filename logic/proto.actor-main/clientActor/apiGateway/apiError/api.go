package api

import (
	"encoding/json"
	"net/http"
	message "winone-hpc/message"
)

func writeError(w http.ResponseWriter, msg string, code int32) {
	resp := &message.Error{
		Code:    code,
		Message: msg,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(int(code))

	json.NewEncoder(w).Encode(resp)
}

var (
	RequestErrorHandler = func(w http.ResponseWriter, err error) {
		writeError(w, err.Error(), http.StatusBadRequest)
	}
	InternalErrorHandler = func(w http.ResponseWriter) {
		writeError(w, "An Unexpected Error Occured", http.StatusInternalServerError)
	}
)
