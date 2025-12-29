const pool = require("./db");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
    try {
        console.log("Seeding admin user...");

        const name = "Admin User";
        const email = "admin@hayan.edu";
        const password = "admin123"; // Initial password
        const role = "Admin";

        // Check if exists
        const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (check.rows.length > 0) {
            console.log("⚠️ Admin user already exists. Skipping.");
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert
        await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
            [name, email, hashedPassword, role]
        );

        console.log(`✅ Admin user created!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding admin:", err);
        process.exit(1);
    }
};

seedAdmin();
