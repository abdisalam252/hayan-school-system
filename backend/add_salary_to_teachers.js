const pool = require("./db");

const addSalaryColumn = async () => {
    try {
        console.log("Adding 'salary' column to 'teachers' table...");

        await pool.query(`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS salary DECIMAL(10, 2) DEFAULT 0;
        `);

        console.log("✅ 'salary' column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating database:", err.message);
        process.exit(1);
    }
};

addSalaryColumn();
