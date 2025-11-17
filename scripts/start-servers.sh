#!/bin/bash
# Start both frontend and backend servers

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "🚀 Starting Labuan FSA E-Submission System"
echo "=========================================="
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 not found. Please install Python 3.11+"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Please install Node.js 18+"; exit 1; }

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}
trap cleanup INT TERM

# Start Backend
echo "🔧 Starting backend server..."
cd "$PROJECT_ROOT/backend" || exit 1

# Install backend dependencies if needed
python3 -c "import fastapi" 2>/dev/null || {
    echo "📦 Installing backend dependencies..."
    pip install -e . > /dev/null 2>&1
}

# Create uploads directory
mkdir -p uploads

# Start backend in background
python3 -m uvicorn labuan_fsa.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --reload \
    > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "   Backend starting on http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is ready!"
else
    echo "   ⚠️  Backend might still be starting. Check logs: tail -f /tmp/backend.log"
fi

# Start Frontend
echo ""
echo "🎨 Starting frontend server..."
cd "$PROJECT_ROOT/frontend" || exit 1

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi

# Start frontend in background
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "   Frontend starting on http://localhost:3000"
echo ""

# Wait for frontend to start
sleep 3

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is ready!"
else
    echo "   ⚠️  Frontend might still be starting. Check logs: tail -f /tmp/frontend.log"
fi

echo ""
echo "=========================================="
echo "✅ Development servers started!"
echo ""
echo "📋 Access URLs:"
echo "   👤 User Frontend: http://localhost:3000"
echo "   🔧 Admin Dashboard: http://localhost:3000/admin"
echo "   📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "👤 Mock Credentials:"
echo "   Admin: admin@labuanfsa.gov.my / admin123"
echo "   User:  user@example.com / user123"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Open browser tabs (macOS)
if command -v open >/dev/null 2>&1; then
    sleep 2
    open http://localhost:3000
    sleep 1
    open http://localhost:8000/docs
fi

# Wait for both processes
wait

