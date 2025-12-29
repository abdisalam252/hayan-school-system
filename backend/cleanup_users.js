const pool = require('./db');

const cleanupUsers = async () => {
    try {
        console.log("Cleaning up users...");
        // Delete everyone except the specific admin
        const res = await pool.query("DELETE FROM users WHERE email != 'admin@hayan.edu'");
        console.log(`✅ Deleted ${res.rowCount} users.`);
    } catch (err) {
        console.error("❌ Error cleaning users:", err.message);
    } finally {
        pool.end();
    }
};

cleanupUsers();
