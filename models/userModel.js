import pool from "../config/db.js";

export const createUser = async (
  name,
  email,
  password,
  role,
  address,
  location
) => {
  try {
    console.log("Creating user with data:", {
      name,
      email,
      role,
      address,
      location: JSON.stringify(location),
    });
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, address, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, email, password, role, address, JSON.stringify(location)]
    );
    console.log("User created:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT * FROM users ORDER BY created_at DESC"
  );
  return result.rows;
};
