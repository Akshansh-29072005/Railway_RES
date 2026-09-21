package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow any origin for development
	},
}

// TelemetryPayload represents the structure of the data sent to the client
type TelemetryPayload struct {
	Trains    []Train    `json:"trains"`
	Blocks    []Block    `json:"blocks"`
	Signals   []Signal   `json:"signals"`
	TSRs         []TSR        `json:"tsrs"`
	Incidents    []Incident   `json:"incidents"`
	MLPrediction MLPrediction `json:"mlPrediction"`
}

type Train struct {
	ID    string    `json:"id"`
	Pos   []float64 `json:"pos"`   // [lat, lng]
	Speed int       `json:"speed"` // km/h
}

type Block struct {
	ID       string `json:"id"`
	Occupied bool   `json:"occupied"`
}

type Signal struct {
	ID     string    `json:"id"`
	Pos    []float64 `json:"pos"`
	Aspect string    `json:"aspect"` // "Green", "Red"
}

type TSR struct {
	ID         string      `json:"id"`
	SpeedLimit int         `json:"speedLimit"`
	Path       [][]float64 `json:"path"` // segment coordinates
	Reason     string      `json:"reason"`
}

type Incident struct {
	ID     string    `json:"id"`
	Type   string    `json:"type"` // e.g., "Chain Pulling", "Track Fracture"
	Pos    []float64 `json:"pos"`
	Status string    `json:"status"` // "Active", "Resolved"
}

type MLPrediction struct {
	TrainID         string `json:"trainId"`
	LiveLocation    string `json:"liveLocation"`
	UpcomingTSRs    int    `json:"upcomingTSRs"`
	WeatherData     string `json:"weatherData"`
	HistoricalDelay int    `json:"historicalDelay"`
	PredictedETA    string `json:"predictedEta"`
	TotalDelayMins  int    `json:"totalDelayMins"`
}

// Global state for dynamic data
var (
	stateMutex       sync.Mutex
	dynamicTSRs      []TSR
	dynamicIncidents []Incident
)

// A segment of real OSM track around Raipur Junction
var trackPath = [][]float64{
	{21.26184, 81.63190},
	{21.26101, 81.63149},
	{21.26060, 81.63128},
	{21.25981, 81.63070},
	{21.25896, 81.63022},
	{21.25837, 81.62990},
	{21.25713, 81.62935}, // Exactly where Incident is logged
	{21.25609, 81.62890}, // Raipur Jn
	{21.25528, 81.62856},
	{21.25406, 81.62802},
	{21.25291, 81.62760},
	{21.25192, 81.62703},
	{21.25086, 81.62612},
	{21.25003, 81.62490},
	{21.24913, 81.62268},
	{21.24887, 81.62021},
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)
	http.HandleFunc("/api/tsr", handleTSR)
	http.HandleFunc("/api/incident", handleIncident)
	http.HandleFunc("/api/v1/eta/predict", handleETAPredict)

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleTSR(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var tsr TSR
	if err := json.NewDecoder(r.Body).Decode(&tsr); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	stateMutex.Lock()
	tsr.ID = "TSR-DYN-" + time.Now().Format("150405")
	dynamicTSRs = append(dynamicTSRs, tsr)
	stateMutex.Unlock()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": tsr.ID})
}

func handleIncident(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var incident Incident
	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	stateMutex.Lock()
	incident.ID = "INC-" + time.Now().Format("150405")
	incident.Status = "Active"
	dynamicIncidents = append(dynamicIncidents, incident)
	stateMutex.Unlock()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": incident.ID})
}

func handleETAPredict(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	stateMutex.Lock()
	currentTSRsCount := len(dynamicTSRs)
	stateMutex.Unlock()

	var mlPred MLPrediction
	mlPred.TrainID = r.URL.Query().Get("trainId")
	if mlPred.TrainID == "" {
		mlPred.TrainID = "TR-12834"
	}
	mlPred.LiveLocation = "km 412 (Bhilai Segment)"
	mlPred.WeatherData = "Clear (0 mins)"
	mlPred.HistoricalDelay = 2

	if currentTSRsCount > 0 {
		mlPred.UpcomingTSRs = currentTSRsCount
		mlPred.TotalDelayMins = 14
		mlPred.PredictedETA = "Delayed by 14 mins"
	} else {
		mlPred.UpcomingTSRs = 0
		mlPred.TotalDelayMins = 0
		mlPred.PredictedETA = "On Time"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(mlPred)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected")

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	step := 0.0

	for {
		<-ticker.C

		// Simulate realistic movement along the exact track
		step += 0.2 // Speed
		
		idx1 := int(step) % len(trackPath)
		idx1Next := (int(step) + 1) % len(trackPath)
		frac1 := step - float64(int(step))

		t1Lat := trackPath[idx1][0] + (trackPath[idx1Next][0]-trackPath[idx1][0])*frac1
		t1Lng := trackPath[idx1][1] + (trackPath[idx1Next][1]-trackPath[idx1][1])*frac1
		
		step2 := step + 4.0
		idx2 := int(step2) % len(trackPath)
		idx2Next := (int(step2) + 1) % len(trackPath)
		frac2 := step2 - float64(int(step2))

		t2Lat := trackPath[idx2][0] + (trackPath[idx2Next][0]-trackPath[idx2][0])*frac2
		t2Lng := trackPath[idx2][1] + (trackPath[idx2Next][1]-trackPath[idx2][1])*frac2

		signal1Aspect := "Green"
		if int(step)%4 < 2 {
			signal1Aspect = "Red"
		}
		
		signal2Aspect := "Red"
		if int(step)%5 < 3 {
			signal2Aspect = "Green"
		}

		stateMutex.Lock()
		currentTSRs := make([]TSR, len(dynamicTSRs))
		copy(currentTSRs, dynamicTSRs)
		
		currentIncidents := make([]Incident, len(dynamicIncidents))
		copy(currentIncidents, dynamicIncidents)
		stateMutex.Unlock()

		// ML Prediction Simulation Logic
		var mlPred MLPrediction
		mlPred.TrainID = "TR-12834"
		mlPred.LiveLocation = "km 412 (Bhilai Segment)"
		mlPred.WeatherData = "Clear (0 mins)"
		mlPred.HistoricalDelay = 2

		if len(currentTSRs) > 0 {
			mlPred.UpcomingTSRs = len(currentTSRs)
			mlPred.TotalDelayMins = 14
			mlPred.PredictedETA = "Delayed by 14 mins"
		} else {
			mlPred.UpcomingTSRs = 0
			mlPred.TotalDelayMins = 0
			mlPred.PredictedETA = "On Time"
		}

		payload := TelemetryPayload{
			Trains: []Train{
				{ID: "TR-12834", Pos: []float64{t1Lat, t1Lng}, Speed: 45},
				{ID: "TR-12810", Pos: []float64{t2Lat, t2Lng}, Speed: 60},
			},
			Blocks: []Block{
				{ID: "BLK-A1", Occupied: true},
				{ID: "BLK-A2", Occupied: false},
				{ID: "BLK-B1", Occupied: int(step)%3 == 0}, // Toggles occupancy
			},
			Signals: []Signal{
				{ID: "SIG-01", Pos: []float64{21.257, 81.630}, Aspect: signal1Aspect},
				{ID: "SIG-02", Pos: []float64{21.254, 81.625}, Aspect: signal2Aspect},
			},
			TSRs:         currentTSRs,
			Incidents:    currentIncidents,
			MLPrediction: mlPred,
		}

		message, err := json.Marshal(payload)
		if err != nil {
			log.Println("JSON marshal error:", err)
			continue
		}

		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}
