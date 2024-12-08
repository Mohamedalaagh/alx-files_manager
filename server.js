import express from 'express';
import controllerRouting from './routes/index';

// Create an instance of an Express application.
const app = express();

// Define the port for the server to listen on, defaulting to 5000.
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests.
app.use(express.json());

// Initialize routing by attaching route controllers.
controllerRouting(app);

// Start the server and listen on the specified port.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;

