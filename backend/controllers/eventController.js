const pool = require("../db");

const getEvents = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM events ORDER BY date ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const addEvent = async (req, res) => {
    try {
        const { title, date, time, location, type, status, notes } = req.body;
        const result = await pool.query(
            "INSERT INTO events (title, date, time, location, type, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [title, date, time, location, type, status || 'Upcoming', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add event: " + err.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, time, location, type, status, notes } = req.body;
        const result = await pool.query(
            "UPDATE events SET title = $1, date = $2, time = $3, location = $4, type = $5, status = $6, notes = $7 WHERE id = $8 RETURNING *",
            [title, date, time, location, type, status, notes, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Event not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update event" });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM events WHERE id = $1", [id]);
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete event" });
    }
};

module.exports = { getEvents, addEvent, updateEvent, deleteEvent };
