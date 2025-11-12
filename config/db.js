import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");
    console.log("Database connected successfully");
    client.release();
  } catch (err) {
    console.error("❌ DB connection error:", err);
    console.log(
      "Please verify your PostgreSQL credentials and make sure the service is running."
    );
  }
};

testConnection();

export default pool;
