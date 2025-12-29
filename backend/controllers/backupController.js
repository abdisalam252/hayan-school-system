const pool = require("../db");

// Helper to get all data from a table
const getTableData = async (table) => {
    try {
        const result = await pool.query(`SELECT * FROM ${table}`);
        return result.rows;
    } catch (e) {
        console.error(`Error fetching ${table}:`, e);
        return [];
    }
};

// Export Data (Backup)
const exportBackup = async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const data = {
            metadata: {
                version: "1.0",
                timestamp: timestamp,
                exported_by: "Hayan School System"
            },
            tables: {
                system_settings: await getTableData('system_settings'),
                users: await getTableData('users'),
                teachers: await getTableData('teachers'),
                classes: await getTableData('classes'),
                students: await getTableData('students'),
                finance: await getTableData('finance'),
                events: await getTableData('events'),
                library: await getTableData('library'),
                transport: await getTableData('transport')
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=backup_${timestamp}.json`);
        res.status(200).send(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Backup failed:", e);
        res.status(500).json({ error: "Backup generation failed" });
    }
};

// Import Data (Restore)
const restoreBackup = async (req, res) => {
    const client = await pool.connect();
    try {
        const { tables } = req.body;
        if (!tables) return res.status(400).json({ error: "Invalid backup file format" });

        await client.query('BEGIN');

        // Identify which tables are being restored
        const tablesToRestore = Object.keys(tables);

        if (tablesToRestore.length === 0) {
            throw new Error("No data selected for restore.");
        }

        // Define valid tables and their safe truncation order (children first)
        // Not strictly necessary if we use CASCADE, but good for logic.
        // We will just iterate the keys provided by the frontend.

        // 1. Clear existing data ONLY for selected tables
        // using CASCADE is risky if we only select parent but not child, 
        // but for now we assume user knows "Restore Students" replaces student data.
        // To be safe 'RESTART IDENTITY CASCADE' will wipe dependent data too.
        // We will notify user in frontend.

        const validTables = ['finance', 'attendance', 'events', 'students', 'teachers', 'users', 'classes'];

        // Filter out invalid table names to prevent SQL injection
        const safeTables = tablesToRestore.filter(t => validTables.includes(t));

        if (safeTables.length > 0) {
            // Construct TRUNCATE statement
            // TRUNCATE table1, table2 ... RESTART IDENTITY CASCADE
            const truncateQuery = `TRUNCATE ${safeTables.join(', ')} RESTART IDENTITY CASCADE`;
            console.log("Executing:", truncateQuery);
            await client.query(truncateQuery);
        }

        // 2. Insert Data
        const insertRows = async (table, rows) => {
            if (!rows || rows.length === 0) return;

            // Validate table name
            if (!validTables.includes(table)) return;

            // Get columns from first row
            const columns = Object.keys(rows[0]);
            if (columns.length === 0) return;

            for (const row of rows) {
                const cols = Object.keys(row);
                const values = Object.values(row);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                const query = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;
                await client.query(query, values);
            }
        };

        // Insert order matters for dependencies
        // We must insert Parents before Children.
        // Order: Users -> Teachers -> Classes -> Students -> Finance/Attendance/Events

        const insertionOrder = ['users', 'teachers', 'classes', 'students', 'finance', 'attendance', 'events'];

        for (const table of insertionOrder) {
            if (tables[table]) {
                await insertRows(table, tables[table]);
            }
        }

        await client.query('COMMIT');
        res.json({
            message: "Restore successful!",
            details: `Restored: ${safeTables.join(', ')}`
        });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Restore failed:", e);
        res.status(500).json({ error: "Restore failed: " + e.message });
    } finally {
        client.release();
    }
};

module.exports = { exportBackup, restoreBackup };
