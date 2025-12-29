const pool = require("./db");

const createBanksTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bank_accounts (
                id SERIAL PRIMARY KEY,
                account_name VARCHAR(100) NOT NULL,
                account_number VARCHAR(50) NOT NULL UNIQUE,
                bank_name VARCHAR(100) NOT NULL,
                balance DECIMAL(15, 2) DEFAULT 0.00,
                currency VARCHAR(10) DEFAULT 'USD',
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'bank_accounts' table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating 'bank_accounts' table:", err);
        process.exit(1);
    }
};

createBanksTable();
