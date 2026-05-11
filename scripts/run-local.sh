#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting Intelligent Mock Interview Agent"

if [ ! -f "$ROOT_DIR/server/.env" ]; then
  echo ""
  echo "Missing server/.env"
  echo "Create server/.env using server/.env.example before running."
  echo ""
  exit 1
fi

echo "Installing backend dependencies if needed..."
cd "$ROOT_DIR/server"
if [ ! -d "node_modules" ]; then
  npm install
fi

echo "Installing frontend dependencies if needed..."
cd "$ROOT_DIR/client"
if [ ! -d "node_modules" ]; then
  npm install
fi

echo "Starting backend on port 5001..."
cd "$ROOT_DIR/server"
npm start &
SERVER_PID=$!

cleanup() {
  echo "Stopping backend..."
  kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting frontend..."
cd "$ROOT_DIR/client"
npm run dev
