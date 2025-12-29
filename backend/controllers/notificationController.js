const pool = require("../db");

// Get all notifications (limit 20)
const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error fetching notifications" });
    }
};

// Create a notification (Internal or API)
const createNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const result = await pool.query(
            "INSERT INTO notifications (title, message, type) VALUES ($1, $2, $3) RETURNING *",
            [title, message || "", type || "info"]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error creating notification" });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error updating notification" });
    }
};

// Mark ALL as read
const markAllAsRead = async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = TRUE");
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error updating notifications" });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
};
