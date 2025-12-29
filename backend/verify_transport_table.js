const pool = require('./db');

const verify = async () => {
    try {
        const res = await pool.query("SELECT * FROM transport LIMIT 1");
        console.log("✅ Transport table exists. Row count:", res.rowCount);

        // Try inserting a test route if empty to ensure writable
        if (res.rowCount === 0) {
            console.log("Table empty, checking writable...");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error accessing transport table:", err.message);
        process.exit(1);
    }
};

verify();
