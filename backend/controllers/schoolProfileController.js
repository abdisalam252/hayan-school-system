const pool = require("../db");
const fs = require('fs');
const path = require('path');

// Get Profile
const getProfile = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM school_profile LIMIT 1");
        if (result.rows.length === 0) {
            return res.json({});
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { school_name, address, phone, email, website, motto, principal_name, established_date, currency } = req.body;

        let logo_url = req.body.logo_url;
        let banner1_url = req.body.banner1_url;
        let banner2_url = req.body.banner2_url;
        let banner3_url = req.body.banner3_url;

        // Handle file uploads
        if (req.files) {
            if (req.files['logo']) logo_url = `/uploads/${req.files['logo'][0].filename}`;
            if (req.files['banner1']) banner1_url = `/uploads/${req.files['banner1'][0].filename}`;
            if (req.files['banner2']) banner2_url = `/uploads/${req.files['banner2'][0].filename}`;
            if (req.files['banner3']) banner3_url = `/uploads/${req.files['banner3'][0].filename}`;
        }

        const check = await pool.query("SELECT * FROM school_profile LIMIT 1");

        let result;
        if (check.rows.length === 0) {
            // Insert
            result = await pool.query(
                "INSERT INTO school_profile (school_name, address, phone, email, website, motto, principal_name, established_date, logo_url, banner_1, banner_2, banner_3, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
                [school_name, address, phone, email, website, motto, principal_name, established_date, logo_url, banner1_url, banner2_url, banner3_url, currency || 'USD']
            );
        } else {
            // Update
            const current = check.rows[0];
            const finalLogo = logo_url || current.logo_url;
            const finalB1 = banner1_url || current.banner_1;
            const finalB2 = banner2_url || current.banner_2;
            const finalB3 = banner3_url || current.banner_3;

            result = await pool.query(
                "UPDATE school_profile SET school_name = $1, address = $2, phone = $3, email = $4, website = $5, motto = $6, principal_name = $7, established_date = $8, logo_url = $9, banner_1 = $10, banner_2 = $11, banner_3 = $12, currency = $13, updated_at = CURRENT_TIMESTAMP WHERE id = $14 RETURNING *",
                [school_name, address, phone, email, website, motto, principal_name, established_date, finalLogo, finalB1, finalB2, finalB3, currency || current.currency || 'USD', current.id]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
