const pool = require("../db");

// Get all finance records
const getFinance = async (req, res) => {
    try {
        const { category } = req.query; // 'income', 'expense', 'salary' or undefined for all

        let query = `
            SELECT f.*, s.grade as student_grade_level, c.name as student_class_name
            FROM finance f
            LEFT JOIN students s ON (f.reference_id = CAST(s.id AS VARCHAR) OR (f.reference_id IS NULL AND f.title = s.name)) AND f.category = 'income'
            LEFT JOIN classes c ON s.class_id = c.id
    `;
        let params = [];

        if (category) {
            query += " WHERE f.category = $1";
            params.push(category);
        }

        query += " ORDER BY f.date DESC, f.id DESC";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Add new finance record
const addFinance = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { category, title, type, amount, status, reference_id, date, payment_method, account_id } = req.body;

        // 1. Insert Finance Record
        const financeResult = await client.query(
            "INSERT INTO finance (category, title, type, amount, status, reference_id, date, payment_method, account_id) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), $8, $9) RETURNING *",
            [category, title, type, amount, status, reference_id, date, payment_method, account_id]
        );

        // 2. Update Bank Balance if account_id is provided
        if (account_id) {
            // Check if account exists
            const accountRes = await client.query("SELECT * FROM bank_accounts WHERE id = $1", [account_id]);
            if (accountRes.rows.length === 0) {
                throw new Error("Selected bank account not found");
            }

            // Update balance
            if (category === 'income') {
                await client.query("UPDATE bank_accounts SET balance = balance + $1 WHERE id = $2", [amount, account_id]);
            } else if (['expenses', 'salaries', 'expense'].includes(category)) {
                await client.query("UPDATE bank_accounts SET balance = balance - $1 WHERE id = $2", [amount, account_id]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json(financeResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Failed to add finance record: " + err.message });
    } finally {
        client.release();
    }
};

// Delete record
const deleteFinance = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM finance WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
        res.json({ message: "Record deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete record" });
    }
};

// Update record
const updateFinance = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, title, type, amount, status, reference_id, date, payment_method } = req.body;

        const result = await pool.query(
            `UPDATE finance 
             SET category = COALESCE($1, category),
    title = COALESCE($2, title),
    type = COALESCE($3, type),
    amount = COALESCE($4, amount),
    status = COALESCE($5, status),
    reference_id = COALESCE($6, reference_id),
    date = COALESCE($7, date),
    payment_method = COALESCE($8, payment_method)
             WHERE id = $9 RETURNING * `,
            [category, title, type, amount, status, reference_id, date, payment_method, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update record" });
    }
};

const resetFinance = async (req, res) => {
    try {
        await pool.query("TRUNCATE TABLE finance RESTART IDENTITY");
        res.json({ message: "All finance data cleared successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to clear finance data" });
    }
};

module.exports = {
    getFinance,
    addFinance,
    updateFinance,
    deleteFinance,
    resetFinance
};
