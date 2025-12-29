const pool = require("./db");

const addAccountIdColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE finance 
            ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL;
        `);
        console.log("✅ Added 'account_id' column to 'finance' table.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating finance table:", err);
        process.exit(1);
    }
};

addAccountIdColumn();
