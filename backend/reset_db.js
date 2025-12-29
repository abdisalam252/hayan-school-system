const pool = require("./db");

const resetDb = async () => {
    try {
        console.log("⚠️ WARNING: RESETTING DATABASE...");
        console.log("This will DELETE ALL DATA. Press Ctrl+C immediately if this is a mistake.");
        console.log("Giving you 5 seconds to cancel...");

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("Initializing database tables (DESTRUCTIVE MODE)...");

        // Drop tables in reverse order of dependency
        await pool.query("DROP TABLE IF EXISTS students");
        await pool.query("DROP TABLE IF EXISTS classes");
        await pool.query("DROP TABLE IF EXISTS teachers");
        await pool.query("DROP TABLE IF EXISTS finance");
        await pool.query("DROP TABLE IF EXISTS events");
        await pool.query("DROP TABLE IF EXISTS library");
        await pool.query("DROP TABLE IF EXISTS transport");
        await pool.query("DROP TABLE IF EXISTS notifications");
        await pool.query("DROP TABLE IF EXISTS school_profile");
        await pool.query("DROP TABLE IF EXISTS issues");
        await pool.query("DROP TABLE IF EXISTS users");


        // --- 1. CORE ACADEMIC TABLES ---

        // Classes Table
        await pool.query(`
            CREATE TABLE classes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                teacher VARCHAR(100),
                room VARCHAR(50),
                level VARCHAR(20),
                grade VARCHAR(20),
                section VARCHAR(5)
            );
        `);
        console.log("✅ 'classes' table created.");

        // Students Table
        await pool.query(`
            CREATE TABLE students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                grade VARCHAR(50), 
                class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
                parent VARCHAR(100),
                phone VARCHAR(20),
                age INTEGER,
                admission_date DATE DEFAULT CURRENT_DATE,
                gender VARCHAR(10),
                status VARCHAR(20) DEFAULT 'Active',
                is_deleted BOOLEAN DEFAULT FALSE,
                deleted_at TIMESTAMP
            );
        `);
        console.log("✅ 'students' table created.");

        // --- 2. STAFF & MANAGEMENT TABLES ---

        // Teachers Table
        await pool.query(`
            CREATE TABLE teachers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                subject VARCHAR(50),
                email VARCHAR(100),
                phone VARCHAR(20),
                bio TEXT,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE,
                deleted_at TIMESTAMP
            );
        `);
        console.log("✅ 'teachers' table created.");

        // Finance Table (Invoices/Expenses/Salaries)
        await pool.query(`
            CREATE TABLE finance (
                id SERIAL PRIMARY KEY,
                category VARCHAR(20) NOT NULL, -- 'income', 'expense', 'salary'
                title VARCHAR(100), -- For expense title or student name or staff name
                type VARCHAR(50), -- 'Tuition Fee', 'Transport Fee', 'Office Supply'
                amount DECIMAL(10, 2) NOT NULL,
                date DATE DEFAULT CURRENT_DATE,
                status VARCHAR(20), -- 'Paid', 'Pending', 'Overdue', 'Approved'
                reference_id VARCHAR(50), -- Optional link to student/staff ID
                payment_method VARCHAR(50)
            );
        `);
        console.log("✅ 'finance' table created.");

        // --- 3. EXTRA MODULE TABLES ---

        // Events Table
        await pool.query(`
            CREATE TABLE events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(20),
                location VARCHAR(100),
                description TEXT,
                type VARCHAR(50) -- 'Academic', 'Sports', 'Cultural'
            );
        `);
        console.log("✅ 'events' table created.");

        // Library Table
        await pool.query(`
            CREATE TABLE library (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                author VARCHAR(100),
                isbn VARCHAR(50),
                status VARCHAR(20) DEFAULT 'Available', -- 'Available', 'Borrowed'
                category VARCHAR(50)
            );
        `);
        console.log("✅ 'library' table created.");

        // Transport Table
        await pool.query(`
            CREATE TABLE transport (
                id SERIAL PRIMARY KEY,
                route_name VARCHAR(100) NOT NULL,
                driver_name VARCHAR(100),
                vehicle_number VARCHAR(20),
                fee DECIMAL(10, 2),
                capacity INTEGER
            );
        `);
        console.log("✅ 'transport' table created.");

        // Notifications Table
        await pool.query(`
            CREATE TABLE notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'notifications' table created.");

        // School Profile Table
        await pool.query(`
             CREATE TABLE school_profile (
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
        console.log("✅ 'school_profile' table created.");

        // Settings Table (Generic)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT
            );
        `);
        console.log("✅ 'settings' table created.");


        console.log("DATABASE RESET COMPLETE! Old data cleared.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error resetting database:", err);
        process.exit(1);
    }
};

resetDb();
