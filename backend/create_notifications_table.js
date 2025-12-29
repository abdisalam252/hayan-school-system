const pool = require("./db");

const createNotificationsTable = async () => {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
        await pool.query(query);
        console.log("✅ Notifications table created successfully.");
    } catch (err) {
        console.error("❌ Error creating notifications table:", err.message);
    } finally {
        pool.end();
    }
};

createNotificationsTable();
