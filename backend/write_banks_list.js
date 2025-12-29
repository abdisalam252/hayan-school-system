const pool = require("./db");
const fs = require('fs');

const listBanks = async () => {
    try {
        const res = await pool.query("SELECT id, bank_name, account_name FROM bank_accounts ORDER BY id");
        const list = res.rows.map(r => `ID: ${r.id}, Bank: ${r.bank_name}, Account: ${r.account_name}`).join('\n');
        fs.writeFileSync('banks_list.txt', list);
        console.log("Written to banks_list.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listBanks();
