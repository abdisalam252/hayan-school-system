const pool = require("../db");

// Get Attendance Summary for Reports
const getAttendanceSummary = async (req, res) => {
    try {
        const totalRecords = await pool.query("SELECT COUNT(*) FROM attendance");
        const presentCount = await pool.query("SELECT COUNT(*) FROM attendance WHERE status = 'Present'");
        const absentCount = await pool.query("SELECT COUNT(*) FROM attendance WHERE status = 'Absent'");
        const lateCount = await pool.query("SELECT COUNT(*) FROM attendance WHERE status = 'Late'");

        // Get attendance by class
        const classAttendance = await pool.query(`
            SELECT c.name as class_name, 
                   COUNT(a.id) as total,
                   SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present
            FROM attendance a
            JOIN classes c ON a.class_id = c.id
            GROUP BY c.name
        `);

        res.json({
            total_records: parseInt(totalRecords.rows[0].count),
            present: parseInt(presentCount.rows[0].count),
            absent: parseInt(absentCount.rows[0].count),
            late: parseInt(lateCount.rows[0].count),
            by_class: classAttendance.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Get attendance for a specific date and class (or all classes)
// Route: GET /api/attendance?date=YYYY-MM-DD&class_id=ID
const getAttendance = async (req, res) => {
    const { date, class_id } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    try {
        let studentsQuery = `
            SELECT s.id, s.name, s.grade, s.class_id, c.level 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.status = 'Active'
        `;
        let studentsParams = [];

        // This is a bit tricky for attendance query if we filter by level, 
        // as attendance table only has class_id, not level directly. 
        // But we just need attendance for the students we find.
        // So we can query attendance by class_ids of the found students OR simply by date
        // and let the map handle it. Using date is simpler since we filter students first.
        let attendanceQuery = "SELECT student_id, status FROM attendance WHERE date = $1";
        let attendanceParams = [date];

        if (class_id && class_id !== 'all') {
            if (class_id === 'Primary' || class_id === 'Intermediate') {
                studentsQuery += " AND c.level = $1";
                studentsParams.push(class_id);
            } else {
                studentsQuery += " AND s.class_id = $1";
                studentsParams.push(class_id);

                // Optimization: if specific class, filter attendance by class too
                attendanceQuery += " AND class_id = $2";
                attendanceParams.push(class_id);
            }
        }

        // Fetch students
        const studentsResult = await pool.query(studentsQuery, studentsParams);
        const students = studentsResult.rows;

        // Fetch attendance records
        const attendanceResult = await pool.query(attendanceQuery, attendanceParams);
        const attendanceMap = {};
        attendanceResult.rows.forEach(row => {
            attendanceMap[row.student_id] = row.status;
        });

        // Merge data
        const data = students.map(student => ({
            ...student,
            status: attendanceMap[student.id] || null
        }));

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Save (Upsert) attendance records
const saveAttendance = async (req, res) => {
    const { date, records } = req.body; // records: [{ student_id, status, class_id }]
    // class_id in body is optional if provided in records

    if (!date || !Array.isArray(records)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const record of records) {
            const { student_id, status, class_id } = record;

            if (!class_id) {
                // If class_id is missing in record, skip or handle error. 
                // Ideally frontend provides it.
                continue;
            }

            // Upsert logic
            await client.query(
                `INSERT INTO attendance (student_id, class_id, date, status)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (student_id, date) 
                 DO UPDATE SET status = EXCLUDED.status, class_id = EXCLUDED.class_id`,
                [student_id, class_id, date, status]
            );
        }

        await client.query("COMMIT");
        res.json({ message: "Attendance saved successfully" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Failed to save attendance" });
    } finally {
        client.release();
    }
};

// Delete attendance records for a specific date and class
const deleteAttendance = async (req, res) => {
    const { date, class_id } = req.body;

    if (!date || !class_id) {
        return res.status(400).json({ error: "Date and Class ID are required" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM attendance WHERE date = $1 AND class_id = $2 RETURNING *",
            [date, class_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No records found to delete" });
        }

        res.json({ message: `Successfully deleted ${result.rowCount} attendance records`, count: result.rowCount });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getAttendanceSummary,
    getAttendance,
    saveAttendance,
    deleteAttendance
};

