const pool = require('./db');

const addColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Upcoming';
        `);
        console.log("✅ Added 'status' column to events table successfully");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding column:", err);
        process.exit(1);
    }
};

addColumn();
