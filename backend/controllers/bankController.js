const pool = require("../db");

// Get all bank accounts
exports.getAccounts = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM bank_accounts ORDER BY id DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Create a new bank account
exports.createAccount = async (req, res) => {
    try {
        const { account_name, account_number, bank_name, balance, currency, status } = req.body;

        const newAccount = await pool.query(
            `INSERT INTO bank_accounts (account_name, account_number, bank_name, balance, currency, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                account_name,
                account_number,
                bank_name,
                balance || 0,
                currency || 'USD',
                status || 'Active'
            ]
        );

        res.json(newAccount.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


// Update an account
exports.updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { account_name, account_number, bank_name, balance, status } = req.body;

        const updatedAccount = await pool.query(
            `UPDATE bank_accounts 
             SET account_name = $1, account_number = $2, bank_name = $3, balance = $4, status = $5
             WHERE id = $6 RETURNING *`,
            [account_name, account_number, bank_name, balance, status, id]
        );

        if (updatedAccount.rows.length === 0) {
            return res.status(404).json({ msg: "Account not found" });
        }

        res.json(updatedAccount.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Delete an account
exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM bank_accounts WHERE id = $1", [id]);
        res.json({ msg: "Account deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Handle Bank Transactions (Deposit, Withdraw, Transfer)
exports.bankTransaction = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { type, accountId, amount, toAccountId, description, date } = req.body;
        const transactionDate = date || new Date();

        // Get Source Account
        const sourceRes = await client.query("SELECT * FROM bank_accounts WHERE id = $1", [accountId]);
        if (sourceRes.rows.length === 0) throw new Error("Source account not found");
        const sourceAccount = sourceRes.rows[0];

        let financeTitle = "";
        let financeType = type; // Deposit, Withdrawal, Transfer

        if (type === 'Deposit') {
            // Add to balance
            await client.query("UPDATE bank_accounts SET balance = balance + $1 WHERE id = $2", [amount, accountId]);
            financeTitle = `Deposit to ${sourceAccount.bank_name}`;
        }
        else if (type === 'Withdrawal') {
            // Deduct from balance
            if (parseFloat(sourceAccount.balance) < parseFloat(amount)) throw new Error("Insufficient funds");
            await client.query("UPDATE bank_accounts SET balance = balance - $1 WHERE id = $2", [amount, accountId]);
            financeTitle = `Withdrawal from ${sourceAccount.bank_name}`;
        }
        else if (type === 'Transfer') {
            // Deduct from Source
            if (parseFloat(sourceAccount.balance) < parseFloat(amount)) throw new Error("Insufficient funds");
            await client.query("UPDATE bank_accounts SET balance = balance - $1 WHERE id = $2", [amount, accountId]);

            // Add to Destination
            const destRes = await client.query("SELECT * FROM bank_accounts WHERE id = $1", [toAccountId]);
            if (destRes.rows.length === 0) throw new Error("Destination account not found");
            const destAccount = destRes.rows[0];

            await client.query("UPDATE bank_accounts SET balance = balance + $1 WHERE id = $2", [amount, toAccountId]);
            financeTitle = `Transfer to ${destAccount.bank_name} (${destAccount.account_name})`;
        }

        // Record in Finance Table (category = 'banks')
        await client.query(
            `INSERT INTO finance (category, title, type, amount, status, date, payment_method) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['banks', financeTitle, type, amount, 'Paid', transactionDate, 'Bank Transfer']
        );

        await client.query('COMMIT');
        res.json({ msg: "Transaction successful" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

