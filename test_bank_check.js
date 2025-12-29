const pool = require("./backend/db");

const test = async () => {
    try {
        const res = await pool.query("SELECT * FROM bank_accounts LIMIT 1");
        console.log("✅ Table exists. Rows:", res.rows);
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e.message);
        process.exit(1);
    }
};

test();
