const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

const updateSchema = async () => {
    try {
        console.log("🔄 Starting database schema update...");

        // 1. Recycle Bin: Add is_deleted to students
        await pool.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);
        console.log("✅ Updated 'students' table (Recycle Bin).");

        // 2. Recycle Bin: Add is_deleted to teachers
        await pool.query(`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);
        console.log("✅ Updated 'teachers' table (Recycle Bin).");

        // 3. Payment Mode: Add payment_method to finance
        await pool.query(`
            ALTER TABLE finance 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
        `);
        console.log("✅ Updated 'finance' table (Payment Mode).");

        console.log("🚀 Schema update completed successfully.");
    } catch (err) {
        console.error("❌ Error updating schema:", err.message);
    } finally {
        pool.end();
    }
};

updateSchema();
