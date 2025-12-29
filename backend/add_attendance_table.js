const pool = require("./db");

const addAttendanceTable = async () => {
    try {
        console.log("Checking/Creating attendance table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL, -- 'Present', 'Absent', 'Late'
                UNIQUE(student_id, date) -- One record per student per day
            );
        `);
        console.log("✅ 'attendance' table ready.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating attendance table:", err);
        process.exit(1);
    }
};

addAttendanceTable();
