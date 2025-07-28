import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let db;

if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
  // Production: Use connection string (with SSL)
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Render, Heroku, etc.
    },
  });
} else {
  // Development: Use individual env variables (enable SSL if needed)
  db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
}

export default db;