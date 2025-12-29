const pool = require("./db");

const verifyDeletion = async () => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM attendance");
        const count = parseInt(result.rows[0].count);

        if (count === 0) {
            console.log("✅ Verification Successful: Attendance table is empty.");
        } else {
            console.error(`❌ Verification Failed: Found ${count} records in attendance table.`);
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error verifying attendance data:", err);
        process.exit(1);
    }
};

verifyDeletion();
