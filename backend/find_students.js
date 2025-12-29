const pool = require("./db");

const findStudents = async () => {
    try {
        const names = ["adssds", "Aamina Samatar", "Safa Abdisalam"];
        console.log(`🔍 Searching for students: ${names.join(", ")}`);

        const result = await pool.query(
            "SELECT id, name, class_id FROM students WHERE name = ANY($1)",
            [names]
        );

        if (result.rows.length > 0) {
            console.log("Found students:");
            console.table(result.rows);
        } else {
            console.log("❌ No students found with these names.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error searching for students:", err);
        process.exit(1);
    }
};

findStudents();
