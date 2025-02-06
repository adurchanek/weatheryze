FROM golang:1.23 AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .
RUN go build -o logging-service

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends libc6 libstdc++6 && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/logging-service /app/logging-service

EXPOSE 5005

CMD ["/app/logging-service"]