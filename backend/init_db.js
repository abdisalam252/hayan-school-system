const pool = require("./db");

const initDb = async () => {
    try {
        console.log("Initializing database tables (SAFE MODE)...");
        console.log("ℹ️ Note: This script checks for missing tables and creates them.");
        console.log("ℹ️ It will NOT delete existing data. If you want to reset the DB, run `node reset_db.js`.");

        // --- 1. CORE ACADEMIC TABLES ---

        // Classes Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS classes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                teacher VARCHAR(100),
                room VARCHAR(50),
                level VARCHAR(20),
                grade VARCHAR(20),
                section VARCHAR(5)
            );
        `);
        console.log("✅ 'classes' table check/creation complete.");

        // Students Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                grade VARCHAR(50), 
                class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
                parent VARCHAR(100),
                phone VARCHAR(20),
                age INTEGER,
                admission_date DATE DEFAULT CURRENT_DATE,
                gender VARCHAR(10),
                status VARCHAR(20) DEFAULT 'Active'
            );
        `);
        console.log("✅ 'students' table check/creation complete.");

        // --- 2. STAFF & MANAGEMENT TABLES ---

        // Teachers Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                subject VARCHAR(50),
                email VARCHAR(100),
                phone VARCHAR(20),
                bio TEXT,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'teachers' table check/creation complete.");

        // Finance Table (Invoices/Expenses/Salaries)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS finance (
                id SERIAL PRIMARY KEY,
                category VARCHAR(20) NOT NULL, -- 'income', 'expense', 'salary'
                title VARCHAR(100), -- For expense title or student name or staff name
                type VARCHAR(50), -- 'Tuition Fee', 'Transport Fee', 'Office Supply'
                amount DECIMAL(10, 2) NOT NULL,
                date DATE DEFAULT CURRENT_DATE,
                status VARCHAR(20), -- 'Paid', 'Pending', 'Overdue', 'Approved'
                reference_id VARCHAR(50) -- Optional link to student/staff ID
            );
        `);
        console.log("✅ 'finance' table check/creation complete.");

        // --- 3. EXTRA MODULE TABLES ---

        // Events Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(20),
                location VARCHAR(100),
                description TEXT,
                type VARCHAR(50) -- 'Academic', 'Sports', 'Cultural'
            );
        `);
        console.log("✅ 'events' table check/creation complete.");

        // Library Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS library (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                author VARCHAR(100),
                isbn VARCHAR(50),
                status VARCHAR(20) DEFAULT 'Available', -- 'Available', 'Borrowed'
                category VARCHAR(50)
            );
        `);
        console.log("✅ 'library' table check/creation complete.");

        // Transport Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transport (
                id SERIAL PRIMARY KEY,
                route_name VARCHAR(100) NOT NULL,
                driver_name VARCHAR(100),
                vehicle_number VARCHAR(20),
                fee DECIMAL(10, 2),
                capacity INTEGER
            );
        `);
        console.log("✅ 'transport' table check/creation complete.");

        // Notifications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'notifications' table check/creation complete.");

        // School Profile Table
        await pool.query(`
             CREATE TABLE IF NOT EXISTS school_profile (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                phone VARCHAR(50),
                email VARCHAR(100),
                website VARCHAR(100),
                logo VARCHAR(255),
                owner_name VARCHAR(100),
                established_year VARCHAR(10),
                currency VARCHAR(10) DEFAULT 'USD'
            );
        `);
        console.log("✅ 'school_profile' table check/creation complete.");


        console.log("Database verification complete. No data was deleted.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error initializing database:", err);
        process.exit(1);
    }
};

initDb();
