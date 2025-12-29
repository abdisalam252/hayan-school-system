const pool = require("./db");

const addDocsColumn = async () => {
    try {
        console.log("Adding 'documents' column to teachers table...");

        await pool.query(`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS documents VARCHAR(255);
        `);

        console.log("✅ Column 'documents' added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding column:", err);
        process.exit(1);
    }
};

addDocsColumn();
