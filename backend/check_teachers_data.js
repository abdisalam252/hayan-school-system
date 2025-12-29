const pool = require("./db");

const checkTeachers = async () => {
    try {
        const result = await pool.query("SELECT id, name, subject FROM teachers");
        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error fetching teachers:", err);
        process.exit(1);
    }
};

checkTeachers();
