const pool = require("./db");

const createSettingsTable = async () => {
    try {
        console.log("Creating system_settings table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(50) PRIMARY KEY,
                value VARCHAR(255) NOT NULL,
                description TEXT
            );
        `);

        console.log("✅ 'system_settings' table created or already exists.");

        // Insert default values if not present
        await pool.query(`
            INSERT INTO system_settings (key, value, description)
            VALUES 
                ('REGISTRATION_FEE', '0', 'Default registration fee amount'),
                ('TUITION_FEE', '0', 'Default tuition fee amount')
            ON CONFLICT (key) DO NOTHING;
        `);
        console.log("✅ Default settings initialized.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
        process.exit(1);
    }
};

createSettingsTable();
