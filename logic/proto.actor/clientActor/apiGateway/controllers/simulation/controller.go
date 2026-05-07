package simulation

import (
	"encoding/json"
	"errors"

	// "fmt"
	"net/http"
	"time"
	apiError "winone-hpc/clientActor/apiGateway/apiError"
	core "winone-hpc/core"

	message "winone-hpc/message"

	"github.com/asynkron/protoactor-go/actor"
	remote "github.com/asynkron/protoactor-go/remote"
)

var UnAuthorizedError = errors.New("Invalid auth token.")

var (
	system       = core.CoreSystem()
	config       = remote.Configure("127.0.0.1", 0)
	remoteConfig = remote.NewRemote(system, config)
	pid          = actor.NewPID("127.0.0.1:8090", "MasterNodeActor")
)

func init() {

	remoteConfig.Start()
}

func MonteCarloOptionsPricing(w http.ResponseWriter, r *http.Request) {

	var req message.OptionsRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiError.RequestErrorHandler(w, err)
		return
	}

	future := system.Root.RequestFuture(pid, &message.NewJobRequest{
		S0:     req.SpotPrice,
		K:      req.StrikePrice,
		Sigma:  req.Volatility,
		R:      req.RiskFreeRate,
		T:      req.Maturity,
		NumSim: req.Simulations,
	}, 5*time.Second)

	result, err := future.Result()
	if err != nil {
		apiError.InternalErrorHandler(w)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
