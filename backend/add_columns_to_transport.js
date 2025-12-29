const pool = require('./db');

const addColumns = async () => {
    try {
        await pool.query(`
            ALTER TABLE transport 
            ADD COLUMN IF NOT EXISTS bus_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10,2) DEFAULT 0;
        `);
        console.log("✅ Added missing columns to transport table successfully");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding columns:", err);
        process.exit(1);
    }
};

addColumns();
