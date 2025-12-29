const pool = require("../db");

// --- EXAMS MANAGEMENT ---

// Get all exams (optionally filter by class or status)
exports.getExams = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, c.name as class_name 
            FROM exams e
            LEFT JOIN classes c ON e.class_id = c.id
            ORDER BY e.date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Create a new exam
exports.createExam = async (req, res) => {
    const { name, subject, class_id, date, time, status, total_marks } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO exams (name, subject, class_id, date, time, status, total_marks) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [name, subject, class_id, date, time, status || 'Draft', total_marks || 100]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create exam" });
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM exams WHERE id = $1", [id]);
        res.json({ message: "Exam deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete exam" });
    }
};

// --- EXAM RESULTS ---

// Get results for an exam (joined with students)
exports.getExamResults = async (req, res) => {
    const { id } = req.params; // exam_id
    try {
        // 1. Get Exam Details to know the class
        const examRes = await pool.query("SELECT * FROM exams WHERE id = $1", [id]);
        if (examRes.rows.length === 0) return res.status(404).json({ error: "Exam not found" });
        const exam = examRes.rows[0];

        // 2. Get all students in that class + their existing marks
        const results = await pool.query(`
            SELECT 
                s.id as student_id, s.name, s.grade as student_grade,
                r.marks, r.grade, r.remarks
            FROM students s
            LEFT JOIN exam_results r ON s.id = r.student_id AND r.exam_id = $1
            WHERE s.class_id = $2 AND s.status = 'Active'
            ORDER BY s.name ASC
        `, [id, exam.class_id]);

        res.json({ exam, students: results.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch results" });
    }
};

// Save (Upsert) results
exports.saveExamResults = async (req, res) => {
    const { id } = req.params; // exam_id
    const { results } = req.body; // [{ student_id, marks, grade, remarks }]

    if (!Array.isArray(results)) return res.status(400).json({ error: "Invalid data" });

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        for (const r of results) {
            await client.query(`
                INSERT INTO exam_results (exam_id, student_id, marks, grade, remarks)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (exam_id, student_id)
                DO UPDATE SET marks = EXCLUDED.marks, grade = EXCLUDED.grade, remarks = EXCLUDED.remarks
            `, [id, r.student_id, r.marks, r.grade, r.remarks]);
        }

        // Also update exam status to 'Completed' if desirable, or let user do it manually.
        // For now, let's just save marks.

        await client.query("COMMIT");
        res.json({ message: "Results saved successfully" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Failed to save results" });
    } finally {
        client.release();
    }
};
// Get aggregated report card for a student
exports.getStudentReportCard = async (req, res) => {
    const { studentId } = req.params;
    try {
        // 1. Get Student Details
        const studentRes = await pool.query("SELECT * FROM students WHERE id = $1", [studentId]);
        if (studentRes.rows.length === 0) return res.status(404).json({ error: "Student not found" });
        const student = studentRes.rows[0];

        // 2. Get Class Details
        let className = "N/A";
        if (student.class_id) {
            const classRes = await pool.query("SELECT name FROM classes WHERE id = $1", [student.class_id]);
            if (classRes.rows.length > 0) className = classRes.rows[0].name;
        }

        // 3. Get Exam Results
        const resultsRes = await pool.query(`
            SELECT 
                e.name as exam_name, e.subject, e.total_marks, e.date,
                r.marks, r.grade, r.remarks
            FROM exam_results r
            JOIN exams e ON r.exam_id = e.id
            WHERE r.student_id = $1
            ORDER BY e.date DESC
        `, [studentId]);

        // 4. Get Attendance Stats
        const attendanceRes = await pool.query(`
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days
            FROM attendance
            WHERE student_id = $1
        `, [studentId]);

        const attendance = attendanceRes.rows[0];

        res.json({
            student: { ...student, class_name: className },
            results: resultsRes.rows,
            attendance: {
                total: parseInt(attendance.total_days) || 0,
                present: parseInt(attendance.present_days) || 0,
                absent: parseInt(attendance.absent_days) || 0,
                rate: attendance.total_days > 0 ? ((attendance.present_days / attendance.total_days) * 100).toFixed(1) : 0
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate report card" });
    }
};
