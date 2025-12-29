const pool = require("./db");

const addIsFreeColumn = async () => {
    try {
        console.log("Adding is_free column...");
        await pool.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;
        `);
        console.log("✅ 'is_free' column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding column:", err);
        process.exit(1);
    }
};

addIsFreeColumn();
