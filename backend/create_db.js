const { Client } = require("pg");
require("dotenv").config();

const createDb = async () => {
    try {
        console.log("Connecting to default 'postgres' database...");
        // Connect to default 'postgres' database to create the new one
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: "postgres", // Default DB
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
        });

        await client.connect();

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.PGDATABASE}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database '${process.env.PGDATABASE}'...`);
            await client.query(`CREATE DATABASE "${process.env.PGDATABASE}"`);
            console.log("✅ Database created successfully.");
        } else {
            console.log("✅ Database already exists.");
        }

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating database:", err);
        process.exit(1);
    }
};

createDb();
