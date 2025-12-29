const pool = require("./db");

const seedData = async () => {
    try {
        console.log("Seeding database...");

        // Seed Teachers
        const teachersCheck = await pool.query("SELECT count(*) FROM teachers");
        if (parseInt(teachersCheck.rows[0].count) === 0) {
            console.log("Seeding teachers...");
            await pool.query(`
                INSERT INTO teachers (name, subject, email, phone, bio, image) VALUES 
                ('Dr. Ahmed Ali', 'Mathematics', 'ahmed.ali@hayan.edu', '+252 61 500 0001', 'Experienced Math teacher with 10 years of experience.', 'https://ui-avatars.com/api/?name=Ahmed+Ali&background=random'),
                ('Ms. Fatuma Omar', 'English', 'fatuma.omar@hayan.edu', '+252 61 500 0002', 'English literature expert.', 'https://ui-avatars.com/api/?name=Fatuma+Omar&background=random'),
                ('Mr. Hassan Abdi', 'Physics', 'hassan.abdi@hayan.edu', '+252 61 500 0003', 'Physics enthusiast and lab supervisor.', 'https://ui-avatars.com/api/?name=Hassan+Abdi&background=random');
            `);
        } else {
            console.log("Teachers table already has data.");
        }

        // Seed Classes
        const classesCheck = await pool.query("SELECT count(*) FROM classes");
        if (parseInt(classesCheck.rows[0].count) === 0) {
            console.log("Seeding classes...");
            await pool.query(`
                INSERT INTO classes (name, teacher, room, level, grade, section) VALUES
                ('Grade 1A', 'Ms. Fatuma Omar', 'Room 101', 'Primary', 'Grade 1', 'A'),
                ('Grade 5B', 'Dr. Ahmed Ali', 'Room 205', 'Intermediate', 'Grade 5', 'B');
            `);
        } else {
            console.log("Classes table already has data.");
        }

        // Seed Students
        const studentsCheck = await pool.query("SELECT count(*) FROM students");
        if (parseInt(studentsCheck.rows[0].count) === 0) {
            console.log("Seeding students...");
            // Get class IDs
            const classRes = await pool.query("SELECT id FROM classes LIMIT 1");
            const classId = classRes.rows.length > 0 ? classRes.rows[0].id : null;

            await pool.query(`
                INSERT INTO students (name, grade, class_id, parent, phone, age, gender, status) VALUES
                ('Abdi Mohamed', 'Grade 1', ${classId}, 'Mohamed Ali', '+252 61 555 1234', 7, 'Male', 'Active'),
                ('Amina Yusuf', 'Grade 1', ${classId}, 'Yusuf Hassan', '+252 61 555 5678', 7, 'Female', 'Active');
            `);
        } else {
            console.log("Students table already has data.");
        }

        // Seed Finance
        const financeCheck = await pool.query("SELECT count(*) FROM finance");
        if (parseInt(financeCheck.rows[0].count) === 0) {
            console.log("Seeding finance...");
            await pool.query(`
                INSERT INTO finance (category, title, type, amount, date, status, reference_id) VALUES
                ('income', 'Abdi Mohamed', 'Tuition Fee', 50.00, CURRENT_DATE, 'Paid', '1'),
                ('income', 'Amina Yusuf', 'Transport Fee', 30.00, CURRENT_DATE, 'Pending', '2'),
                ('expenses', 'Office Supplies', 'Operational', 150.00, CURRENT_DATE, 'Approved', 'ADMIN'),
                ('salaries', 'Dr. Ahmed Ali', 'Teacher Salary', 1200.00, CURRENT_DATE, 'Paid', '1');
            `);
        } else {
            console.log("Finance table already has data.");
        }

        // Seed Events
        const eventsCheck = await pool.query("SELECT count(*) FROM events");
        if (parseInt(eventsCheck.rows[0].count) === 0) {
            console.log("Seeding events...");
            await pool.query(`
                INSERT INTO events (title, date, time, location, description, type) VALUES
                ('Math Olympiad', CURRENT_DATE + INTERVAL '5 days', '09:00 AM', 'Main Hall', 'Annual Math competition.', 'Academic'),
                ('Parent Meeting', CURRENT_DATE + INTERVAL '10 days', '10:00 AM', 'Auditorium', 'Discussing term progress.', 'Meeting');
            `);
        } else {
            console.log("Events table already has data.");
        }

        console.log("✅ Seeding complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
};

seedData();
