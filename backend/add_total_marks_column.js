const pool = require("./db");

const addTotalMarksColumn = async () => {
    try {
        console.log("Checking/Adding total_marks column...");

        await pool.query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 100;
        `);

        console.log("✅ 'total_marks' column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding column:", err);
        process.exit(1);
    }
};

addTotalMarksColumn();
