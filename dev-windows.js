// dev-windows.js - Custom script for running the application on Windows
// This script sets the required environment variables and runs the server

// Set environment variables
process.env.NODE_ENV = 'development';

// Import tsx cli and run the server
try {
  console.log('Starting server in development mode...');
  console.log('Setting NODE_ENV=development');
  
  // Load and execute the server directly using the tsx command
  // Since we can't use require in ES modules, we'll use child_process to execute the command
  import('child_process').then(childProcess => {
    const { spawn } = childProcess;
    
    console.log('Running: npx tsx server/index.ts');
    const proc = spawn('npx', ['tsx', 'server/index.ts'], { 
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('error', (err) => {
      console.error('Failed to start server process:', err);
    });
    
    proc.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
  });
} catch (error) {
  console.error('Error starting the server:');
  console.error(error);
  
  console.log('\nIt appears there was an error. Try running:');
  console.log('npm install');
  console.log('npm install --save-dev tsx');
  
  process.exit(1);
}