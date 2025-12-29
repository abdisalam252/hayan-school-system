const pool = require("./db");

const checkStudents = async () => {
    try {
        console.log("Checking students table...");

        const countRes = await pool.query("SELECT COUNT(*) FROM students");
        const allRes = await pool.query("SELECT id, name, status FROM students LIMIT 5");

        console.log(`Total students in DB: ${countRes.rows[0].count}`);

        if (allRes.rows.length > 0) {
            console.log("Sample students:", allRes.rows);
        } else {
            console.log("No students found in the table.");
        }

        // Check if table exists at all
        const tableCheck = await pool.query("SELECT to_regclass('students')");
        console.log("Table 'students' exists:", tableCheck.rows[0].to_regclass !== null);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error checking DB:", err);
        process.exit(1);
    }
};

checkStudents();
