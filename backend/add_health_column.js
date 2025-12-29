const pool = require("./db");

const addHealthColumn = async () => {
    try {
        console.log("Adding health_status column...");
        await pool.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS health_status TEXT;
        `);
        console.log("✅ 'health_status' column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding column:", err);
        process.exit(1);
    }
};

addHealthColumn();
