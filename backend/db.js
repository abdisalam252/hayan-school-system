const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

if (!process.env.DATABASE_URL) {
  connectionConfig.user = process.env.PGUSER;
  connectionConfig.host = process.env.PGHOST;
  connectionConfig.database = process.env.PGDATABASE;
  connectionConfig.password = process.env.PGPASSWORD;
  connectionConfig.port = process.env.PGPORT;
  delete connectionConfig.connectionString; // Use individual params if no URL
}

const pool = new Pool(connectionConfig);

pool.connect()
  .then(() => {
    console.log('✅ Database connected successfully!');
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = pool;