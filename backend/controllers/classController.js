const pool = require("../db");

// Get all classes
// Get all classes with active student count
const getClasses = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, COUNT(s.id)::int as student_count 
            FROM classes c 
            LEFT JOIN students s ON c.id = s.class_id AND s.status = 'Active' 
            GROUP BY c.id 
            ORDER BY c.id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Database query failed" });
    }
};

// Add new class
const addClass = async (req, res) => {
    try {
        const { teacher, room, level, grade, section } = req.body;

        if (!level || !grade || !section) {
            return res.status(400).json({ error: "Fadlan soo gali Level, Grade iyo Section." });
        }

        // Construct full name, e.g., "Grade 1-A"
        const name = `${grade}-${section}`;

        const result = await pool.query(
            "INSERT INTO classes (name, teacher, room, level, grade, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, teacher, room, level, grade, section]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add class." });
    }
};

// Update a class
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher, room, level, grade, section } = req.body;

        // Re-construct full name if fields are updated
        let name = null;
        if (grade && section) {
            name = `${grade}-${section}`;
        }

        const result = await pool.query(
            `UPDATE classes SET 
                teacher = COALESCE($1, teacher), 
                room = COALESCE($2, room), 
                level = COALESCE($3, level), 
                grade = COALESCE($4, grade), 
                section = COALESCE($5, section),
                name = COALESCE($4, grade) || '-' || COALESCE($5, section)
             WHERE id = $6 RETURNING *`,
            [teacher, room, level, grade, section, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update class." });
    }
};

// Delete a class
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM classes WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json({ message: "Class deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete class." });
    }
};

module.exports = {
    getClasses,
    addClass,
    updateClass,
    deleteClass,
};
