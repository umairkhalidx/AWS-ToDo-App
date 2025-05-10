require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const AWS = require('aws-sdk');

const app = express();
const upload = multer();
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Middleware
const auth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
  res.status(201).json({ user: { name, email } });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET);
  res.cookie('token', token, { httpOnly: true }).json({ user: { name: user.name, email: user.email } });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token').sendStatus(200);
});

app.get('/check-auth', (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

// Task Routes
app.get('/tasks', auth, async (req, res) => {
  const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ?', [req.user.id]);
  res.json({ tasks });
});

app.post('/tasks', auth, async (req, res) => {
  const { text } = req.body;
  await db.query('INSERT INTO tasks (user_id, text) VALUES (?, ?)', [req.user.id, text]);
  res.sendStatus(201);
});

app.put('/tasks/:id', auth, async (req, res) => {
  const { text } = req.body;
  await db.query('UPDATE tasks SET text = ? WHERE id = ? AND user_id = ?', [text, req.params.id, req.user.id]);
  res.sendStatus(200);
});

app.delete('/tasks/:id', auth, async (req, res) => {
  await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.sendStatus(200);
});

// File Uploads
app.post('/upload-task-pdf', auth, upload.single('pdf'), async (req, res) => {
  const key = `pdfs/${req.user.id}.pdf`;
  await s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  }).promise();
  res.sendStatus(200);
});

app.get('/task-pdf', auth, async (req, res) => {
  const key = `pdfs/${req.user.id}.pdf`;
  const url = s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: 3600
  });
  res.json({ pdfUrl: url });
});

app.post('/upload-profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  const key = `profiles/${req.user.id}.jpg`;
  await s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  }).promise();
  res.sendStatus(200);
});

app.get('/profile-pic', auth, async (req, res) => {
  const key = `profiles/${req.user.id}.jpg`;
  const url = s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: 3600
  });
  res.json({ profilePicUrl: url });
});

app.put('/profile', auth, async (req, res) => {
  const { name, email } = req.body;
  await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
  res.json({ user: { name, email } });
});

app.get('/', (req, res) => {
    res.send('Server is running');
  });
  
app.get('/health', (req, res) => {
res.json({ status: 'ok' });
});
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
