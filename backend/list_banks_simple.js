const pool = require("./db");

const listBanks = async () => {
    try {
        const res = await pool.query("SELECT id, bank_name, account_name FROM bank_accounts ORDER BY id");
        res.rows.forEach(r => console.log(`ID: ${r.id} | Bank: ${r.bank_name} | Account: ${r.account_name}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listBanks();
