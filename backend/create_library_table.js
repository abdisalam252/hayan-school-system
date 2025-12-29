const pool = require('./db');

const createLibraryTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS library_books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Available',
                borrower_name VARCHAR(255),
                borrow_date DATE,
                return_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Created library_books table");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    } finally {
        pool.end();
    }
};

createLibraryTable();
