require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// AWS S3 Config
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// MySQL RDS Config
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: process.env.RDS_PORT,
};

// Test RDS Connection & List Tables
app.get('/api/rds-tables', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      [dbConfig.database]
    );
    await connection.end();
    res.json({ tables: rows.map(row => row.table_name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test S3 Connection & List Objects
app.get('/api/s3-files', async (req, res) => {
  try {
    const data = await s3.listObjectsV2({
      Bucket: process.env.S3_BUCKET_NAME,
    }).promise();
    res.json({ files: data.Contents.map(file => file.Key) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));