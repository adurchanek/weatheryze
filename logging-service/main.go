package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type LogMessage struct {
	Level   string `json:"level"`
	Message string `json:"message"`
}

func logHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var msg LogMessage
	err := json.NewDecoder(r.Body).Decode(&msg)
	if err != nil {
		http.Error(w, "Could not decode JSON", http.StatusBadRequest)
		return
	}

	log.Printf("[%s] %s\n", msg.Level, msg.Message)

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("Logged successfully\n"))
}

func main() {
	// Register the handler for POST /log
	http.HandleFunc("/log", logHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5005"
	}

	fmt.Printf("Logging service running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
