const pool = require("./db");

const addRecycleBinColumns = async () => {
    try {
        console.log("Adding recycle bin columns...");

        // Students Table
        await pool.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);
        console.log("Updated students table.");

        // Teachers Table
        await pool.query(`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);
        console.log("Updated teachers table.");

        console.log("✅ Database schema updated for Recycle Bin.");
    } catch (err) {
        console.error("❌ Error updating schema:", err.message);
    } finally {
        pool.end();
    }
};

addRecycleBinColumns();
