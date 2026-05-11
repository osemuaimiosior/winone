FROM golang:1.26

WORKDIR /app

# Install Docker CLI and standalone docker-compose
# (docker-compose-plugin is not available in this Debian image)
RUN apt-get update && \
    apt-get install -y docker.io docker-compose && \
    rm -rf /var/lib/apt/lists/*

# Download Go dependencies
COPY go.mod ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o clientdp main.go

# Start the application
CMD ["./clientdp"]