import pool from "./config/db.js";

const checkUsers = async () => {
  try {
    // Get all users from the database
    const result = await pool.query("SELECT * FROM users ORDER BY id");

    console.log("📊 Total users in database:", result.rows.length);
    console.log("\n👥 Users List:");
    console.log("=".repeat(80));

    if (result.rows.length === 0) {
      console.log("🔍 No users found in the database.");
    } else {
      result.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Address: ${user.address || "Not provided"}`);
        console.log(
          `   Location: ${
            user.location ? JSON.stringify(user.location) : "Not provided"
          }`
        );
        console.log(`   Created: ${user.created_at}`);
        console.log("-".repeat(60));
      });
    }

    // Get count by role
    const roleCount = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);

    if (roleCount.rows.length > 0) {
      console.log("\n📈 Users by Role:");
      roleCount.rows.forEach((row) => {
        console.log(`   ${row.role}: ${row.count} users`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    process.exit(0);
  }
};

checkUsers();
