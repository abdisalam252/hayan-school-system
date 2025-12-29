const pool = require('./db');

(async () => {
    try {
        console.log("Checking for currency column...");
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='school_profile' AND column_name='currency') THEN 
                    ALTER TABLE school_profile ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'; 
                    RAISE NOTICE 'Added currency column';
                END IF; 
            END $$;
        `);
        console.log("Migration successful: currency column ensured.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
})();
