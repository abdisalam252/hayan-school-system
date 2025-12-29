const pool = require("../db");

// Get all routes
const getRoutes = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM transport ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Add new route
const addRoute = async (req, res) => {
    try {
        console.log("Adding new route:", req.body);
        const { route_name, bus_number, driver_name, driver_phone, price_per_month } = req.body;
        const result = await pool.query(
            "INSERT INTO transport (route_name, bus_number, driver_name, driver_phone, price_per_month) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [route_name, bus_number, driver_name, driver_phone, price_per_month || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add route: " + err.message });
    }
};

// Update route
const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { route_name, bus_number, driver_name, driver_phone, price_per_month } = req.body;

        const result = await pool.query(
            "UPDATE transport SET route_name = $1, bus_number = $2, driver_name = $3, driver_phone = $4, price_per_month = $5 WHERE id = $6 RETURNING *",
            [route_name, bus_number, driver_name, driver_phone, price_per_month, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "Route not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update route" });
    }
};

// Delete route
const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM transport WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Route not found" });
        res.json({ message: "Route deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete route" });
    }
};

module.exports = {
    getRoutes,
    addRoute,
    updateRoute,
    deleteRoute
};
