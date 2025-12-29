const pool = require("./db");
const bcrypt = require("bcryptjs");

const addGuray = async () => {
    try {
        console.log("Adding Gurays School admin...");

        const name = "Gurays Admin";
        const email = "guraysschool@gmail.com";
        const password = "admin123";
        const role = "Admin";

        // Check if exists
        const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (check.rows.length > 0) {
            console.log("⚠️ User already exists. Updating password to 'admin123'...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);
            console.log("✅ Password updated.");
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert
            await pool.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
                [name, email, hashedPassword, role]
            );
            console.log(`✅ User created!`);
        }

        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

addGuray();
