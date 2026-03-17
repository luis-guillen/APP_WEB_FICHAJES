#!/bin/bash

# start_all.sh
# Script to run both backend and frontend concurrently for demo purposes

echo "Iniciando Time Flow (Back + Front)..."

# 1. Run Backend Seed just in case DB needs generation
cd backend
source venv/bin/activate || echo "No venv found, assuming dependencies are system-wide or already mapped"
python seed_demo.py
echo "Semilla de base de datos finalizada."

# 2. Start Backend using Uvicorn in the background
echo "Levantando Backend (FastAPI)..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 3. Start Frontend using Vite
cd ..
echo "Levantando Frontend (Vite)..."
npm run dev &
FRONTEND_PID=$!

# Handler to kill both processes on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo "Los servicios están levantados:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:8080"
echo ""
echo "Pulsa Ctrl+C para apagar los servidores."

# Wait indefinitely so the script doesn't term and kill background jobs
wait
