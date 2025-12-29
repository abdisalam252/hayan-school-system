const pool = require("./db");

const migrateTeachersTable = async () => {
    try {
        console.log("🔄 Adding 'role' column to teachers table...");

        await pool.query(`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Teacher';
        `);

        console.log("✅ 'role' column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error migrating teachers table:", err);
        process.exit(1);
    }
};

migrateTeachersTable();
