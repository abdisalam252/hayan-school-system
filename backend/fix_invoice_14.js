const pool = require("./db");

const fixInvoice = async () => {
    try {
        console.log("Fixing Invoice 14...");
        // First find the student ID for Axmed shaafici
        const studentRes = await pool.query("SELECT id FROM students WHERE name ILIKE 'Axmed shaafici'");

        if (studentRes.rows.length === 0) {
            console.log("Student not found!");
            process.exit(1);
        }

        const studentId = studentRes.rows[0].id;
        console.log(`Found Student ID: ${studentId}`);

        // Update finance record
        const updateRes = await pool.query("UPDATE finance SET reference_id = $1 WHERE id = 14 RETURNING *", [studentId]);
        console.log("Updated Record:", updateRes.rows[0]);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixInvoice();
