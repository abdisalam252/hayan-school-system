const pool = require("../db");

// Get all settings
const getSettings = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM system_settings");
        // Convert array to object { key: value } for easier frontend usage
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

// Update a setting
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const result = await pool.query(
            "INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *",
            [key, value]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update setting" });
    }
};

// Batch update settings
const updateSettingsBatch = async (req, res) => {
    try {
        const settings = req.body; // Expecting { key: value, key2: value2 }

        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                "INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
                [key, value]
            );
        }

        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update settings" });
    }
};

module.exports = {
    getSettings,
    updateSetting,
    updateSettingsBatch
};
