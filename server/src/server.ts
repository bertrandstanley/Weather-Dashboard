import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import routes from './routes/index.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debugging the API key
console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY);

// Initialize the Express app and set the port to either the environment variable or default to 3001
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to enable CORS - must be above other middlewares
app.use(cors());  

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client dist folder (compiled frontend)
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Mount API routes under /api prefix
app.use('/api', routes);

// Start the server and log the port it's running on
app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});

