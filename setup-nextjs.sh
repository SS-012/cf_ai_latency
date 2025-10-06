#!/bin/bash

echo "🚀 Setting up Next.js Cloudflare Edge Latency Tester..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Environment variables for Next.js development
# Add your database and API keys here

# Database URL (if using a real database instead of mock)
# DATABASE_URL="your_database_url_here"

# Cloudflare API credentials (if using real Cloudflare services)
# CLOUDFLARE_API_TOKEN="your_api_token_here"
# CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
EOF
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Click 'Run Test' to test the latency measurement"
echo ""
echo "📚 For more information, see README-NEXTJS.md"
