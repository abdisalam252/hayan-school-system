const pool = require("../db");

// Get all books
const getBooks = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM library_books ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Add new book
const addBook = async (req, res) => {
    try {
        const { title, author, isbn } = req.body;
        const result = await pool.query(
            "INSERT INTO library_books (title, author, isbn) VALUES ($1, $2, $3) RETURNING *",
            [title, author, isbn]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add book" });
    }
};

// Update book
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, status, borrower_name } = req.body;

        const result = await pool.query(
            "UPDATE library_books SET title = $1, author = $2, isbn = $3, status = $4, borrower_name = $5 WHERE id = $6 RETURNING *",
            [title, author, isbn, status, borrower_name, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "Book not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update book" });
    }
};

// Delete book
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM library_books WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Book not found" });
        res.json({ message: "Book deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete book" });
    }
};

module.exports = {
    getBooks,
    addBook,
    updateBook,
    deleteBook
};
