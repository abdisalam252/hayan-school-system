const pool = require("./db");

const debugFinance = async () => {
    try {
        console.log("--- Finance Record 14 ---");
        const finance = await pool.query("SELECT * FROM finance WHERE id = 14");
        console.log("Finance Record:", finance.rows[0]);

        if (finance.rows.length > 0) {
            const refId = finance.rows[0].reference_id;
            console.log("Reference ID:", refId);

            if (refId) {
                const student = await pool.query("SELECT * FROM students WHERE id = $1", [refId]);
                console.log("Student Record:", student.rows[0]);

                if (student.rows.length > 0) {
                    const classId = student.rows[0].class_id;
                    if (classId) {
                        const cls = await pool.query("SELECT * FROM classes WHERE id = $1", [classId]);
                        console.log("Class Record:", cls.rows[0]);
                    } else {
                        console.log("Student has no class_id");
                    }
                }
            } else {
                console.log("No reference_id in finance record");
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugFinance();
