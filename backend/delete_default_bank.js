const pool = require("./db");

const deleteDefaultBank = async () => {
    try {
        console.log("Deleting default bank account (ID 1)...");
        const res = await pool.query("DELETE FROM bank_accounts WHERE id = 1 RETURNING *");

        if (res.rowCount > 0) {
            console.log("Deleted:", res.rows[0]);
        } else {
            console.log("Account ID 1 not found (already deleted).");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error deleting bank:", err);
        process.exit(1);
    }
};

deleteDefaultBank();
