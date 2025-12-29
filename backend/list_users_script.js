const pool = require("./db");

const listUsers = async () => {
    try {
        const res = await pool.query("SELECT * FROM users");
        console.log("Current Users:");
        console.table(res.rows.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listUsers();
