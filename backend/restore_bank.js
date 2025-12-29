const pool = require("./db");

const restoreBank = async () => {
    try {
        console.log("Restoring Commercial Bank...");
        // Check if it exists first
        const check = await pool.query("SELECT * FROM bank_accounts WHERE bank_name = 'Commercial Bank'");
        if (check.rows.length > 0) {
            console.log("Commercial Bank already exists.");
        } else {
            const res = await pool.query(`
                INSERT INTO bank_accounts (account_name, account_number, bank_name, balance, currency, status) 
                VALUES ('Main Account', '1001', 'Commercial Bank', 0, 'USD', 'Active') RETURNING *
            `);
            console.log("Restored:", res.rows[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error restoring bank:", err);
        process.exit(1);
    }
};

restoreBank();
