const pool = require("../db");

// Get all teachers
const getTeachers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM teachers ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Add new teacher
const addTeacher = async (req, res) => {
    try {
        const { name, subject, email, phone, bio, salary, role } = req.body;

        // Handle Files
        let image = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        let document_path = null;

        if (req.files) {
            if (req.files.image) {
                image = `http://localhost:5002/${req.files.image[0].path.replace(/\\/g, '/')}`;
            }
            if (req.files.document) {
                document_path = `http://localhost:5002/${req.files.document[0].path.replace(/\\/g, '/')}`;
            }
        }

        const result = await pool.query(
            "INSERT INTO teachers (name, subject, email, phone, bio, salary, image, document_path, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [name, subject, email, phone, bio, salary || 0, image, document_path, role || 'Teacher']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add staff member" });
    }
};

// Update teacher
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, email, phone, bio, salary, role } = req.body;

        let imageUpdateQuery = "";
        let docUpdateQuery = "";
        let values = [name, subject, email, phone, bio, salary, role, id];
        let paramIndex = 9;

        // Check for new files
        if (req.files) {
            if (req.files.image) {
                const imagePath = `http://localhost:5002/${req.files.image[0].path.replace(/\\/g, '/')}`;
                imageUpdateQuery = `, image = $${paramIndex}`;
                values.push(imagePath);
                paramIndex++;
            }
            if (req.files.document) {
                const docPath = `http://localhost:5002/${req.files.document[0].path.replace(/\\/g, '/')}`;
                docUpdateQuery = `, document_path = $${paramIndex}`;
                values.push(docPath);
                paramIndex++;
            }
        }

        const query = `
            UPDATE teachers 
            SET name = COALESCE($1, name), 
                subject = COALESCE($2, subject), 
                email = COALESCE($3, email), 
                phone = COALESCE($4, phone), 
                bio = COALESCE($5, bio),
                salary = COALESCE($6, salary),
                role = COALESCE($7, role)
                ${imageUpdateQuery}
                ${docUpdateQuery}
            WHERE id = $8 
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update teacher" });
    }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM teachers WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json({ message: "Teacher deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete teacher" });
    }
};

module.exports = {
    getTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher
};

