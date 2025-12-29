const pool = require("../db");

// Get all issues for a specific student
const getStudentIssues = async (req, res) => {
    try {
        const { studentId } = req.params;
        const result = await pool.query(
            "SELECT * FROM issues WHERE student_id = $1 ORDER BY date DESC, created_at DESC",
            [studentId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch issues." });
    }
};

// Create a new issue
const createIssue = async (req, res) => {
    try {
        const { student_id, type, title, description, date, status, reported_by } = req.body;

        if (!student_id || !title || !type) {
            return res.status(400).json({ error: "Student ID, Type, and Title are required." });
        }

        const result = await pool.query(
            "INSERT INTO issues (student_id, type, title, description, date, status, reported_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [student_id, type, title, description || '', date || new Date(), status || 'Open', reported_by || 'System']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to create issue." });
    }
};

// Update an issue
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, description, date, status, reported_by } = req.body;

        const result = await pool.query(
            "UPDATE issues SET type = COALESCE($1, type), title = COALESCE($2, title), description = COALESCE($3, description), date = COALESCE($4, date), status = COALESCE($5, status), reported_by = COALESCE($6, reported_by) WHERE id = $7 RETURNING *",
            [type, title, description, date, status, reported_by, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update issue." });
    }
};

// Delete an issue
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM issues WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json({ message: "Issue deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete issue." });
    }
};

module.exports = {
    getStudentIssues,
    createIssue,
    updateIssue,
    deleteIssue
};
