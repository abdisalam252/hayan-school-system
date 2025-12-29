const pool = require("./db");

const testInsert = async () => {
    try {
        console.log("Attempting to insert test class...");

        const testClass = {
            name: "Debug-Grade-1-A",
            teacher: "Debug Teacher",
            room: "101",
            level: "Primary",
            grade: "Grade 1",
            section: "A"
        };

        const result = await pool.query(
            "INSERT INTO classes (name, teacher, room, level, grade, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [testClass.name, testClass.teacher, testClass.room, testClass.level, testClass.grade, testClass.section]
        );

        console.log("✅ Insert Successful!", result.rows[0]);

        // Clean up
        await pool.query("DELETE FROM classes WHERE name = $1", [testClass.name]);
        console.log("✅ Test row deleted.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Insert Failed:", err.message);
        console.error("Full Error:", err);
        process.exit(1);
    }
};

testInsert();
