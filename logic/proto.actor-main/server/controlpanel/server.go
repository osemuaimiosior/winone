package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"

	pb "winone-hpc/server/controlpanel/message"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

type jobServer struct {
	pb.UnimplementedControlpanelServer
}

// Manual implementation (still works with gRPC)

func (s *jobServer) Start(ctx context.Context, req *pb.StartMessage) (*pb.StartResponse, error) {
	log.Printf("Received StartMessage: nodes=%d unix=%d",
		req.StartUpNodeCount,
		req.StartDateUnix,
	)

	return &pb.StartResponse{
		Message: fmt.Sprintf("Cluster started with %d nodes", req.StartUpNodeCount),
	}, nil
}

func (s *jobServer) SubmitJob(ctx context.Context, req *pb.NewJobRequest) (*pb.NewJobResponse, error) {
	log.Printf("Received NewJobRequest: S0=%.2f K=%.2f sigma=%.2f r=%.4f T=%.2f numSim=%d",
		req.SpotPrice,
		req.StrikePrice,
		req.Volatility,
		req.RiskFreeRate,
		req.Maturity,
		req.Simulations,
	)

	result := fmt.Sprintf("Option price computed using %d simulations", req.Simulations)

	return &pb.NewJobResponse{
		Code:   200,
		Result: result,
	}, nil
}

func main() {
	cert, err := tls.LoadX509KeyPair("../../certs/server.crt", "../../certs/server.key")
	if err != nil {
		log.Fatal(err)
	}

	tlsConfig := &tls.Config{
		Certificates: []tls.Certificate{cert},
	}

	creds := credentials.NewTLS(tlsConfig)

	grpcServer := grpc.NewServer(grpc.Creds(creds))
	pb.RegisterControlpanelServer(grpcServer, &jobServer{})

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Secure gRPC server listening on :50051")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
