const pool = require("./db");

const updateSchema = async () => {
    try {
        console.log("Updating database schema...");

        // Issues Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL, -- 'Behavior', 'Academic', 'Medical', 'Other'
                title VARCHAR(100) NOT NULL,
                description TEXT,
                date DATE DEFAULT CURRENT_DATE,
                status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'Resolved', 'Dismissed'
                reported_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'issues' table created (if it didn't exist).");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating schema:", err);
        process.exit(1);
    }
};

updateSchema();
