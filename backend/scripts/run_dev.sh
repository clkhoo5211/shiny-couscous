#!/bin/bash
# Run backend development server

cd "$(dirname "$0")/.." || exit

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Check if Python dependencies are installed
python -c "import fastapi, uvicorn" 2>/dev/null || {
    echo "❌ Python dependencies not installed. Installing..."
    pip install -e .
}

# Create uploads directory if it doesn't exist
mkdir -p uploads

echo "🚀 Starting backend server on http://127.0.0.1:8000"
echo "📚 API docs available at http://127.0.0.1:8000/docs"
echo ""

python -m uvicorn labuan_fsa.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --reload \
    --reload-dir src/labuan_fsa

