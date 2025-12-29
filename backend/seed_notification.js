const pool = require("./db");

const seedNotification = async () => {
    try {
        const query = `
      INSERT INTO notifications (title, message, type) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
        const values = ["Test Notification", "This is a test notification from the new system.", "success"];
        const res = await pool.query(query, values);
        console.log("✅ Notification inserted:", res.rows[0]);
    } catch (err) {
        console.error("❌ Error inserting notification:", err.message);
    } finally {
        pool.end();
    }
};

seedNotification();
