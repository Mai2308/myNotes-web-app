import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// ✅ SQL Server configuration
const config = {
  user: process.env.SQL_USER || "sa",                     // default SQL Server admin user
  password: process.env.SQL_PASSWORD || "Mynoteswebapp27", // must match Docker setup
  server: process.env.DB_HOST || "localhost",
  database: process.env.SQL_DATABASE || "NotesApp",
  options: {
    encrypt: true,
    trustServerCertificate: true, // needed for local/dev
  },
};

// ✅ Create connection pool
export const pool = new sql.ConnectionPool(config);

// ✅ Connect to the database
export const poolConnect = pool.connect()
  .then(() => console.log("✅ Connected to SQL Server successfully!"))
  .catch(err => console.error("❌ Database connection failed:", err));
