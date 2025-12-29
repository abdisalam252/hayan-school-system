const pool = require("./db");

const testUpdate = async () => {
    try {
        console.log("Attempting to insert test class for update...");

        // 1. Insert
        const insertRes = await pool.query(
            "INSERT INTO classes (name, teacher, room, level, grade, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            ["Debug-Class-1-A", "Teacher 1", "Room 1", "Primary", "Grade 1", "A"]
        );
        const classId = insertRes.rows[0].id;
        console.log("✅ Inserted class with ID:", classId);

        // 2. Update
        console.log("Attempting to update class...");
        const teacher = "Teacher 2 (Updated)";
        const room = "Room 2 (Updated)";
        const level = "Primary";
        const grade = "Grade 2";
        const section = "B";
        // Constructing params as per controller
        // [teacher, room, level, grade, section, null, id]

        const updateRes = await pool.query(
            `UPDATE classes SET 
                teacher = COALESCE($1, teacher), 
                room = COALESCE($2, room), 
                level = COALESCE($3, level), 
                grade = COALESCE($4, grade), 
                section = COALESCE($5, section),
                name = COALESCE($4, grade) || '-' || COALESCE($5, section)
             WHERE id = $6 RETURNING *`,
            [teacher, room, level, grade, section, classId]
        );

        if (updateRes.rows.length > 0) {
            console.log("✅ Update Successful!", updateRes.rows[0]);
            if (updateRes.rows[0].teacher === teacher && updateRes.rows[0].grade === grade) {
                console.log("✅ Data verification passed.");
            } else {
                console.error("❌ Data verification failed.");
            }
        } else {
            console.error("❌ Update returned 0 rows.");
        }

        // 3. Clean up
        await pool.query("DELETE FROM classes WHERE id = $1", [classId]);
        console.log("✅ Test row deleted.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Test Failed:", err.message);
        console.error("Full Error:", err);
        process.exit(1);
    }
};

testUpdate();
