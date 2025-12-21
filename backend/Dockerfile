FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./

ENV GOPROXY=https://proxy.golang.org,direct
ENV GOPRIVATE=

RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download || go mod download || go mod download

COPY . .

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /mapbot ./cmd/server

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /importer ./cmd/importer

FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /mapbot /app/mapbot
COPY --from=builder /importer /app/importer

EXPOSE 8080 9090

CMD ["/app/mapbot"]
