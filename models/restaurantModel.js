import pool from "../config/db.js";

export const createRestaurant = async (userId, name, rating, menu) => {
  const result = await pool.query(
    `INSERT INTO restaurants (user_id, name, rating, menu)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, name, rating, JSON.stringify(menu)]
  );
  return result.rows[0];
};
