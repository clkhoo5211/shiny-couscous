#!/bin/bash
# Start both frontend and backend in development mode

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Labuan FSA E-Submission System"
echo "=========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd "$PROJECT_ROOT/backend" || exit 1

# Create config.local.toml if it doesn't exist
if [ ! -f "config.local.toml" ]; then
    echo "⚠️  config.local.toml not found. Creating from example..."
    cp config.example.toml config.local.toml
fi

# Seed mock users if needed
echo "👤 Setting up mock users..."
python3 scripts/seed_mock_users.py 2>/dev/null || {
    echo "⚠️  Could not seed mock users. Make sure database is set up."
}

# Start backend server
chmod +x scripts/run_dev.sh 2>/dev/null
./scripts/run_dev.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd "$PROJECT_ROOT/frontend" || exit 1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo ""
echo "📋 Access URLs:"
echo "   Frontend (User): http://localhost:3000"
echo "   Backend API:     http://localhost:8000"
echo "   API Docs:        http://localhost:8000/docs"
echo ""
echo "👤 Mock Credentials:"
echo "   Admin: admin@labuanfsa.gov.my / admin123"
echo "   User:  user@example.com / user123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Trap Ctrl+C and kill both processes
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for both processes
wait

