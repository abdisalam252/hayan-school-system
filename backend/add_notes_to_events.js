const pool = require("./db");

const addNotesColumn = async () => {
    try {
        console.log("Adding 'notes' column to 'events' table...");

        await pool.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS notes TEXT,
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Upcoming';
        `);

        console.log("✅ 'notes' and 'status' columns added/verified successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating events table:", err);
        process.exit(1);
    }
};

addNotesColumn();
