import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// 1. Extract the Pool from the function so it's accessible everywhere
const pool = globalThis.poolGlobal ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Save the pool in global memory for Nodemon
if (process.env.NODE_ENV !== "production") {
  globalThis.poolGlobal = pool;
}

// 2. Configure Prisma with this global Pool
const prismaClientSingleton = () => {
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter, 
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✓ Database connected successfully");
    } catch(error) {
        console.error(`✗ Database connection error: ${error.message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        
        if (pool) {
            await pool.end();
        }
        
        console.log("✓ Database pool closed successfully");
    } catch (error) {
        console.error("✗ Error closing database connection:", error.message);
    }
};

export { prisma, connectDB, disconnectDB };