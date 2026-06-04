const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

router.delete('/posts/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [req.params.id]
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/ban', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.execute({
      sql: 'UPDATE users SET is_banned = 1 WHERE id = ?',
      args: [req.params.id]
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
