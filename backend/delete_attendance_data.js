const pool = require("./db");

const deleteAttendanceData = async () => {
    try {
        console.log("🗑️ Deleting all attendance records...");

        const result = await pool.query("DELETE FROM attendance");

        console.log(`✅ Successfully deleted ${result.rowCount} attendance records.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error deleting attendance data:", err);
        process.exit(1);
    }
};

deleteAttendanceData();
