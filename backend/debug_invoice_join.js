const pool = require("./db");

const debugJoin = async () => {
    try {
        console.log("Testing Invoice 14 Join...");

        const query = `
            SELECT f.id, f.title, f.reference_id, s.id as student_id, s.name as student_name, s.grade, s.class_id, c.name as class_name
            FROM finance f
            LEFT JOIN students s ON (f.reference_id = CAST(s.id AS VARCHAR) OR (f.reference_id IS NULL AND f.title = s.name)) AND f.category = 'income'
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE f.id = 14
        `;

        const result = await pool.query(query);
        console.log("Result:", result.rows[0]);

        if (!result.rows[0].student_id) {
            console.log("Join failed to find student.");
            // Check for name mismatch
            const financeRecord = await pool.query("SELECT title FROM finance WHERE id = 14");
            const name = financeRecord.rows[0].title;
            console.log(`Finance Title: '${name}'`);

            const potentialMatches = await pool.query("SELECT name FROM students WHERE name ILIKE $1", [`%${name}%`]);
            console.log("Potential student matches:", potentialMatches.rows);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugJoin();
