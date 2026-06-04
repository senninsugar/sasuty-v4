const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await db.execute({
      sql: 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "user")',
      args: [username, email, hashedPassword]
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    
    const user = result.rows[0];
    if (!user || user.is_banned === 1 || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: Number(user.id), role: user.role }, process.env.JWT_SECRET || 'sasuty_secret_key_123', { expiresIn: '24h' });
    res.json({ token, user: { id: Number(user.id), username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const userResult = await db.execute({
      sql: 'SELECT id, username, bio, role FROM users WHERE id = ?',
      args: [req.params.id]
    });
    if (!userResult.rows.length) return res.sendStatus(404);
    
    const followers = await db.execute({ sql: 'SELECT COUNT(*) as count FROM follows WHERE following_id = ?', args: [req.params.id] });
    const following = await db.execute({ sql: 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', args: [req.params.id] });
    
    res.json({
      user: userResult.rows[0],
      followers: followers.rows[0].count,
      following: following.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/follow/:id', authenticateToken, async (req, res) => {
  try {
    await db.execute({
      sql: 'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      args: [req.user.id, req.params.id]
    });
    await db.execute({
      sql: 'INSERT INTO notifications (user_id, type, sender_id) VALUES (?, "follow", ?)',
      args: [req.params.id, req.user.id]
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
