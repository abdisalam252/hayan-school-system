const pool = require('./db');

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(100),
                location VARCHAR(255),
                type VARCHAR(100),
                description TEXT,
                status VARCHAR(50) DEFAULT 'Upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Events table created successfully");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating table:", err);
        process.exit(1);
    }
};

createTable();
