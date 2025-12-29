const pool = require("./db");

const listBanks = async () => {
    try {
        console.log("Listing all bank accounts...");
        const res = await pool.query("SELECT * FROM bank_accounts ORDER BY id");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("❌ Error listing banks:", err);
        // If table doesn't exist, we'll know
        process.exit(1);
    }
};

listBanks();
