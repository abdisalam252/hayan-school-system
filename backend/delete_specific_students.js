const pool = require("./db");

const deleteStudents = async () => {
    try {
        const names = ["adssds", "Aamina Samatar", "Safa Abdisalam"];
        console.log(`🗑️ Deleting students: ${names.join(", ")}...`);

        // First, delete related records to avoid foreign key constraints (if any, though 'ON DELETE SET NULL' or standard FKs usually block)
        // Actually, we should check if they have attendance records (which we already deleted)
        // or other related data like grades, finance, etc.
        // Assuming cascade delete or similar logic isn't strictly enforced or we want to force delete.
        // But for "students" table usually we just delete the row.

        // Note: Resetting attendance earlier cleared that dependency.

        const result = await pool.query(
            "DELETE FROM students WHERE name = ANY($1) RETURNING name",
            [names]
        );

        if (result.rowCount > 0) {
            console.log(`✅ Successfully deleted ${result.rowCount} students:`);
            result.rows.forEach(r => console.log(` - ${r.name}`));
        } else {
            console.log("⚠️ No students found to delete.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error deleting students:", err);
        process.exit(1);
    }
};

deleteStudents();
