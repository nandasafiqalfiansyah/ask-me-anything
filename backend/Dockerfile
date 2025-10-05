# Gunakan image Go resmi
FROM golang:1.21-alpine

# Set environment variables
ENV GO111MODULE=on \
    GOPROXY=https://goproxy.io

# Set working directory di dalam container
WORKDIR /app

# Copy file modul Go
COPY go.mod go.sum ./

# Download dependencies
RUN go mod tidy

# Copy semua source code ke container
COPY . .

# Build aplikasi (opsional, bisa juga langsung run)
RUN go build -o main .

# Jalankan aplikasi
CMD ["./main"]
