const pool = require("./db");

const listBanks = async () => {
    try {
        const res = await pool.query("SELECT id, bank_name, account_name, account_number FROM bank_accounts ORDER BY id");
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listBanks();
