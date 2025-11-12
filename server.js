import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import pool from "./config/db.js";

dotenv.config();

const app = express();

// CORS configuration - Updated for Vercel deployment
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL, // Add your Vercel frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost for development
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      // Allow all Vercel deployments (*.vercel.app)
      if (origin && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/auth", authRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error details:", {
    message: err.message,
    stack: err.stack,
    query: err.query,
  });

  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// For Vercel serverless functions, we export the app
// For local development, we start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("👉 CORS enabled for:", allowedOrigins);
  });
}

// Export for Vercel
export default app;
