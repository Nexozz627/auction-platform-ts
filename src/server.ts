import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from "./config/db.js";
import itemsRoutes from "./routes/itemsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { startAuctionCron } from "./jobs/auctionJob.js";

config(); //read the .env

const app = express(); 

app.set('trust proxy', 1); //trust the caddy proxy

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  // 
  origin: [
    "http://127.0.0.1:5500",           // my local live server
    //"https://amine-abbaci.xyz",         // my domain
    //"https://www.amine-abbaci.xyz",     
    "https://auction-platform-b9aq91rnk-auction-platform.vercel.app",
    "https://auction-platform-ts.vercel.app"     
  ],
  
  // REQUIRED for the browser to accept and store the HTTP-only cookie
  credentials: true 
}));

//my routes
app.use("/items", itemsRoutes);
app.use("/auth", authRoutes);


//const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
//const swaggerDocument = YAML.load(swaggerPath);
//app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



const PORT = 5001;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Start the auction cron (running every 10s to close expirated items) job in the background at server startup
startAuctionCron();

// Graceful shutdown function
const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Cleaning up and shutting down...`);
    
    // 1. Close the server (stops new connections)
    server.close(async (err) => {
        if (err) console.error("Server shutdown error:", err);
        
        // 2. Properly close the database
        await disconnectDB();
        
        // 3. Exit
        console.log("Process stopped.");
        process.exit(0);
    });
};

// listen to stop signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGUSR2', () => shutdown('SIGUSR2')); //for Nodemon

//FOR GLOBAL CRASHES

// for sync err without a try/catch
process.on('uncaughtException', (err) => {
    console.error('✗ CRITICAL ERROR (Uncaught Exception):', err.message);
    console.error(err.stack); 
    shutdown('UNCAUGHT_EXCEPTION');
});

// for async err without a try/catch
process.on('unhandledRejection', (reason, promise) => {
    console.error('✗ CRITICAL ERROR (Unhandled Rejection) at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
});