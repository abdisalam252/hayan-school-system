const pool = require('./db');

const listUsers = async () => {
    try {
        console.log("Fetching users...");
        const res = await pool.query("SELECT * FROM users");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        pool.end();
    }
};

listUsers();
