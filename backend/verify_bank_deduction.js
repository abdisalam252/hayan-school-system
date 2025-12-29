const pool = require("./db");
// const axios = require("axios"); // Removed unused dependency

const API_URL = "http://localhost:5002/api";

const verifyDeduction = async () => {
    try {
        console.log("🚀 Starting Verification...");

        // 1. Get or Create Bank Account
        let bankId;
        const banksRes = await pool.query("SELECT * FROM bank_accounts LIMIT 1");
        if (banksRes.rows.length === 0) {
            console.log("No banks found. Creating one...");
            const newBank = await pool.query(`
                INSERT INTO bank_accounts (account_name, account_number, bank_name, balance, currency, status)
                VALUES ('Test Bank', '123456789', 'Test Bank Corp', 1000.00, 'USD', 'Active') RETURNING *
            `);
            bankId = newBank.rows[0].id;
        } else {
            bankId = banksRes.rows[0].id;
        }

        // Get Initial Balance
        const initialBankRes = await pool.query("SELECT * FROM bank_accounts WHERE id = $1", [bankId]);
        const initialBalance = parseFloat(initialBankRes.rows[0].balance);
        console.log(`Initial Balance for Bank ID ${bankId}: $${initialBalance}`);

        // 2. Add Income (Fee Collection)
        const incomeAmount = 500;
        console.log(`Adding Income of $${incomeAmount}...`);

        // Emulate Frontend Payload
        const incomePayload = {
            category: 'income',
            amount: incomeAmount,
            status: 'Paid',
            title: 'Test Student',
            type: 'Tuition Fee',
            payment_method: 'Test Bank Corp', // Name
            account_id: bankId // ID
        };

        // We use direct fetch/axios to call API
        // Note: Using fetch since node 18+ has it. If not, we might need a library or just use pool directly to test controller logic? 
        // Better to test API.
        // But running inside node script without server running? 
        // Ah, the server IS running (user has it open). I can call localhost:5002.

        const incomeRes = await fetch(`${API_URL}/finance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomePayload)
        });

        if (!incomeRes.ok) throw new Error("Failed to add income: " + await incomeRes.text());
        console.log("✅ Income added.");

        // Check Balance
        const postIncomeRes = await pool.query("SELECT * FROM bank_accounts WHERE id = $1", [bankId]);
        const postIncomeBalance = parseFloat(postIncomeRes.rows[0].balance);
        console.log(`Balance after Income: $${postIncomeBalance}`);

        if (postIncomeBalance !== initialBalance + incomeAmount) {
            console.error(`❌ Balance Mismatch! Expected ${initialBalance + incomeAmount}, got ${postIncomeBalance}`);
        } else {
            console.log("✅ Balance successfully increased.");
        }

        // 3. Add Expense
        const expenseAmount = 200;
        console.log(`Adding Expense of $${expenseAmount}...`);

        const expensePayload = {
            category: 'expenses',
            amount: expenseAmount,
            status: 'Headmaster', // Status or reference
            title: 'Office Supplies',
            type: 'Supplies',
            payment_method: 'Test Bank Corp',
            account_id: bankId
        };

        const expenseRes = await fetch(`${API_URL}/finance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expensePayload)
        });

        if (!expenseRes.ok) throw new Error("Failed to add expense: " + await expenseRes.text());
        console.log("✅ Expense added.");

        // Check Balance
        const postExpenseRes = await pool.query("SELECT * FROM bank_accounts WHERE id = $1", [bankId]);
        const postExpenseBalance = parseFloat(postExpenseRes.rows[0].balance);
        console.log(`Balance after Expense: $${postExpenseBalance}`);

        if (postExpenseBalance !== postIncomeBalance - expenseAmount) {
            console.error(`❌ Balance Mismatch! Expected ${postIncomeBalance - expenseAmount}, got ${postExpenseBalance}`);
        } else {
            console.log("✅ Balance successfully decreased.");
        }

        console.log("🎉 Verification Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Verification Failed:", err);
        process.exit(1);
    }
};

verifyDeduction();
