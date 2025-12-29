const pool = require("../db");

// Get all students
const getStudents = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM students WHERE is_deleted = FALSE ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Database query failed" });
    }
};

// Add new student
const addStudent = async (req, res) => {
    try {
        const { name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free } = req.body;
        // Basic validation
        if (!name) {
            return res.status(400).json({ error: "Magaca waa lama huraan." });
        }

        const result = await pool.query(
            "INSERT INTO students (name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            [name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free || false]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add student." });
    }
};

// Update a student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Magaca waa in la keenaa." });
        }

        const result = await pool.query(
            "UPDATE students SET name = COALESCE($1, name), grade = COALESCE($2, grade), class_id = COALESCE($3, class_id), parent = COALESCE($4, parent), phone = COALESCE($5, phone), age = COALESCE($6, age), admission_date = COALESCE($7, admission_date), gender = COALESCE($8, gender), health_status = COALESCE($9, health_status), is_free = COALESCE($10, is_free), status = COALESCE($11, status) WHERE id = $12 RETURNING *",
            [name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update student." });
    }
};

// Delete a student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("UPDATE students SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete student." });
    }
};

// Bulk Import Students
const importStudents = async (req, res) => {
    try {
        const students = req.body; // Expecting array of objects
        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: "Invalid data format. Expected an array of students." });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Sequential processing to allow partial success
        for (const [index, student] of students.entries()) {
            if (!student.name) {
                results.failed++;
                results.errors.push(`Row ${index + 1}: Name is required.`);
                continue;
            }

            try {
                const name = student.name;
                const grade = student.grade || 'N/A';
                const class_id = student.class_id ? parseInt(student.class_id) : null;
                const parent = student.parent || '';
                const phone = student.phone || '';
                const age = student.age ? parseInt(student.age) : null;
                const admission_date = student.admission_date || new Date().toISOString().split('T')[0];
                const gender = student.gender || 'Other';
                const health_status = student.health_status || '';
                const is_free = student.is_free === 'true' || student.is_free === true;

                await pool.query(
                    "INSERT INTO students (name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                    [name, grade, class_id, parent, phone, age, admission_date, gender, health_status, is_free]
                );
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(`Row ${index + 1} (${student.name}): ${err.message}`);
            }
        }

        res.json({
            message: "Import processing complete",
            summary: results
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to import students." });
    }
};

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents
};
