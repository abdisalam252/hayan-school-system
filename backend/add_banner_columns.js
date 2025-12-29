const pool = require("./db");

const addBannerColumns = async () => {
    try {
        await pool.query(`
      ALTER TABLE school_profile 
      ADD COLUMN IF NOT EXISTS banner_1 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS banner_2 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS banner_3 VARCHAR(255);
    `);
        console.log("SUCCESS: Banner columns added to school_profile.");
    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        pool.end();
    }
};

addBannerColumns();
