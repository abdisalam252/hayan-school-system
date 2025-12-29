const pool = require('./db');

const createTransportTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transport (
                id SERIAL PRIMARY KEY,
                route_name VARCHAR(255) NOT NULL,
                bus_number VARCHAR(50),
                driver_name VARCHAR(255),
                driver_phone VARCHAR(50),
                price_per_month DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Created transport table");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    } finally {
        pool.end();
    }
};

createTransportTable();
