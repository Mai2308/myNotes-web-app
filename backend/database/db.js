// database/db.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// SQL Server configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Use true if SQL Server requires encryption
    trustServerCertificate: true, // Needed for self-signed certs (Docker)
  },
};

let pool; // Will hold the ConnectionPool instance

// Function to connect to the database
export const poolConnect = (async () => {
  if (!pool) {
    try {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log("✅ SQL Pool Connected!");
    } catch (err) {
      console.error("❌ SQL Server connection failed:", err);
      throw err; // Propagate error so server.js can catch it
    }
  }
  return pool;
})();

// Optional helper to get the pool after it has connected
export const getPool = () => {
  if (!pool) throw new Error("Pool not initialized. Await poolConnect first.");
  return pool;
};
