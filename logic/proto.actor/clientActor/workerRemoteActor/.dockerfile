FROM golang:1.22-alpine

WORKDIR /app

COPY . .

RUN go mod tidy
RUN go build -o nodeWorker nodeWorker.go

CMD ["./nodeWorker"]