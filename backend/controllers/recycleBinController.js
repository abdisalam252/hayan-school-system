const pool = require("../db");

// Get all deleted items
const getDeletedItems = async (req, res) => {
    try {
        const students = await pool.query("SELECT id, name, 'Student' as type, deleted_at FROM students WHERE is_deleted = TRUE");
        const teachers = await pool.query("SELECT id, name, 'Teacher' as type, deleted_at FROM teachers WHERE is_deleted = TRUE");

        // Combine results
        const combined = [...students.rows, ...teachers.rows].sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));

        res.json(combined);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Restore item
const restoreItem = async (req, res) => {
    try {
        const { type, id } = req.body;
        let table = "";

        if (type === 'Student') table = 'students';
        else if (type === 'Teacher') table = 'teachers';
        else return res.status(400).json({ error: "Invalid type" });

        const result = await pool.query(`UPDATE ${table} SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });

        res.json({ message: "Item restored successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to restore item" });
    }
};

// Permanently delete item
const deleteItem = async (req, res) => {
    try {
        const { type, id } = req.body; // Using body for delete content to keep simple, or params if preferred. 
        // Let's use params if possible, but type is needed. simpler to use POST for 'force-delete' action or body.
        // Let's assume standard DELETE with JSON body or URL params. 
        // Best practice: DELETE /api/recycle-bin/:type/:id
    } catch (err) { }
};

// Improved delete implementation
const forceDelete = async (req, res) => {
    try {
        const { type, id } = req.params;
        let table = "";

        if (type === 'Student') table = 'students';
        else if (type === 'Teacher') table = 'teachers';
        else return res.status(400).json({ error: "Invalid type" });

        const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });

        res.json({ message: "Item permanently deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete item" });
    }
};

module.exports = {
    getDeletedItems,
    restoreItem,
    forceDelete
};
