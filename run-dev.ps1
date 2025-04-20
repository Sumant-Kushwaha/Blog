# PowerShell script to run the development server
Write-Host "Starting SmartBlog in development mode..."

# Set environment variable for this session
$env:NODE_ENV = "development"

# Run the server
Write-Host "Running: npx tsx server/index.ts"
npx tsx server/index.ts