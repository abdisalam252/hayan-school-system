const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "hayan_secret_key_123";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Check password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Create token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error during login" });
    }
};

const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
            [name, email, hashedPassword, role || 'Staff']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add user" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        let query = "UPDATE users SET name = $1, email = $2, role = $3";
        let params = [name, email, role];
        let paramIndex = 4;

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += `, password = $${paramIndex}`;
            params.push(hashedPassword);
            paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role`;
        params.push(id);

        const result = await pool.query(query, params);

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update user" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete user" });
    }
};

module.exports = { login, getUsers, addUser, updateUser, deleteUser };
