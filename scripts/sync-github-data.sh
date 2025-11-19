#!/bin/bash
# Sync backend/data JSON files from GitHub repository
# This script pulls the latest JSON data files from GitHub for local development

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/backend/data"

# GitHub repository configuration
GITHUB_OWNER="${GITHUB_OWNER:-clkhoo5211}"
GITHUB_REPO="${GITHUB_REPO:-shiny-couscous}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# JSON files to sync from GitHub
JSON_FILES=(
    "forms.json"
    "users_auth.json"
    "admins_auth.json"
    "admin_roles.json"
    "submissions.json"
    "sessions.json"
    "settings.json"
    "files.json"
    "database.json"
)

echo "🔄 Syncing JSON data from GitHub..."
echo "=========================================="
echo "Repository: $GITHUB_OWNER/$GITHUB_REPO"
echo "Branch: $GITHUB_BRANCH"
echo ""

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN not set. Using public API (rate limited)."
    echo "   To avoid rate limits, set GITHUB_TOKEN environment variable."
    echo "   You can create a token at: https://github.com/settings/tokens"
    echo ""
    AUTH_HEADER=""
else
    AUTH_HEADER="Authorization: token $GITHUB_TOKEN"
fi

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Function to download a file from GitHub
download_file() {
    local file_path="backend/data/$1"
    local output_path="$DATA_DIR/$1"
    
    # GitHub API URL for raw file content
    local api_url="https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/contents/$file_path?ref=$GITHUB_BRANCH"
    
    # Download file
    if [ -n "$GITHUB_TOKEN" ]; then
        response=$(curl -s -H "$AUTH_HEADER" "$api_url")
    else
        response=$(curl -s "$api_url")
    fi
    
    # Check if we got an error
    if echo "$response" | grep -q '"message"'; then
        error_msg=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo "   ❌ Failed to download $1: $error_msg"
        return 1
    fi
    
    # Extract content and decode base64
    content=$(echo "$response" | grep -o '"content":"[^"]*"' | cut -d'"' -f4 | sed 's/\\n//g')
    
    if [ -z "$content" ]; then
        echo "   ❌ Failed to extract content for $1"
        return 1
    fi
    
    # Decode base64 and save to file
    echo "$content" | base64 -d > "$output_path"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Synced $1"
        return 0
    else
        echo "   ❌ Failed to save $1"
        return 1
    fi
}

# Alternative method using raw GitHub URLs (simpler, no token needed for public repos)
download_file_raw() {
    local file_path="backend/data/$1"
    local output_path="$DATA_DIR/$1"
    
    # GitHub raw content URL
    local raw_url="https://raw.githubusercontent.com/$GITHUB_OWNER/$GITHUB_REPO/$GITHUB_BRANCH/$file_path"
    
    # Download file
    if curl -s -f -o "$output_path" "$raw_url"; then
        echo "   ✅ Synced $1"
        return 0
    else
        echo "   ❌ Failed to download $1"
        return 1
    fi
}

# Sync each JSON file
success_count=0
failed_count=0

for file in "${JSON_FILES[@]}"; do
    if download_file_raw "$file"; then
        ((success_count++))
    else
        ((failed_count++))
    fi
done

echo ""
echo "=========================================="
if [ $failed_count -eq 0 ]; then
    echo "✅ Successfully synced $success_count files"
else
    echo "⚠️  Synced $success_count files, $failed_count failed"
fi
echo ""

