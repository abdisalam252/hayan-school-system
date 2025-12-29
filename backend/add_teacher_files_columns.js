const pool = require('./db');

const addColumns = async () => {
    try {
        await pool.query(`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS document_path VARCHAR(255);
        `);
        console.log("✅ Added document_path column to teachers table.");
    } catch (err) {
        console.error("❌ Error adding columns:", err.message);
    } finally {
        pool.end();
    }
};

addColumns();
