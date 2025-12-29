const pool = require('./db');

const createSchoolProfileTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS school_profile (
                id SERIAL PRIMARY KEY,
                school_name VARCHAR(255) DEFAULT 'Hayan School',
                address TEXT,
                phone VARCHAR(50),
                email VARCHAR(255),
                logo_url TEXT,
                website VARCHAR(255),
                established_date DATE,
                motto VARCHAR(255),
                principal_name VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default row if empty
        await pool.query(`
            INSERT INTO school_profile (id, school_name)
            SELECT 1, 'Hayan School'
            WHERE NOT EXISTS (SELECT 1 FROM school_profile);
        `);

        console.log("✅ Created school_profile table");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    } finally {
        pool.end();
    }
};

createSchoolProfileTable();
