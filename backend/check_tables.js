const pool = require("./db");

async function checkTables() {
    try {
        console.log("Checking database tables...");

        try {
            const teachers = await pool.query("SELECT COUNT(*) FROM teachers");
            console.log(`✅ Teachers table exists. Count: ${teachers.rows[0].count}`);
        } catch (e) {
            console.log("❌ Teachers table error:", e.message);
        }

        try {
            const finance = await pool.query("SELECT COUNT(*) FROM finance");
            console.log(`✅ Finance table exists. Count: ${finance.rows[0].count}`);
        } catch (e) {
            console.log("❌ Finance table error:", e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error("Global error:", e);
        process.exit(1);
    }
}

checkTables();
