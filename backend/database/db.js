import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

export const poolConnect = sql.connect({
  user: process.env.DB_USER || "sa",           // <- change 'root' to 'sa'
  password: process.env.DB_PASSWORD || "YourStrong!Pass123", // <- must match Docker
  server: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "NotesApp",
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
});
