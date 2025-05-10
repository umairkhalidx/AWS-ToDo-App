require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// MySQL Database Connection
const dbConfig = {
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: process.env.RDS_PORT
};

let pool;
(async () => {
  pool = await mysql.createPool(dbConfig);
  console.log('Connected to MySQL database');
})();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    
    req.user = users[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// User Registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    res.status(201).json({ id: result.insertId, username, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD Operations for Posts
app.get('/posts', authenticate, async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT * FROM posts WHERE user_id = ?', [req.user.id]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    let imageUrl = null;
    
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `posts/${Date.now()}_${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      
      const uploadedFile = await s3.upload(params).promise();
      imageUrl = uploadedFile.Location;
    }
    
    const [result] = await pool.query(
      'INSERT INTO posts (title, content, image_url, user_id) VALUES (?, ?, ?, ?)',
      [title, content, imageUrl, req.user.id]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      title, 
      content, 
      image_url: imageUrl 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/posts/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;
    let imageUrl = null;
    
    // Check if post belongs to user
    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [postId, req.user.id]);
    if (!posts.length) return res.status(404).json({ error: 'Post not found' });
    
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `posts/${Date.now()}_${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      
      const uploadedFile = await s3.upload(params).promise();
      imageUrl = uploadedFile.Location;
    }
    
    await pool.query(
      'UPDATE posts SET title = ?, content = ?, image_url = COALESCE(?, image_url) WHERE id = ?',
      [title, content, imageUrl, postId]
    );
    
    res.json({ id: postId, title, content, image_url: imageUrl || posts[0].image_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post belongs to user
    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [postId, req.user.id]);
    if (!posts.length) return res.status(404).json({ error: 'Post not found' });
    
    await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));