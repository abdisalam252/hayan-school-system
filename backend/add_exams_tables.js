const pool = require("./db");

const addExamsTable = async () => {
    try {
        console.log("Checking/Creating exams tables...");

        // Exams Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
                date DATE NOT NULL,
                time VARCHAR(20),
                status VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Published', 'Completed'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'exams' table ready.");

        // Results Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_results (
                id SERIAL PRIMARY KEY,
                exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                marks DECIMAL(5, 2),
                grade VARCHAR(5),
                remarks TEXT,
                UNIQUE(exam_id, student_id)
            );
        `);
        console.log("✅ 'exam_results' table ready.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating exams tables:", err);
        process.exit(1);
    }
};

addExamsTable();
