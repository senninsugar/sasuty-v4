const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    await db.execute({
      sql: 'INSERT INTO dms (sender_id, receiver_id, message, expires_at) VALUES (?, ?, ?, datetime("now", "+7 days"))',
      args: [req.user.id, receiver_id, message]
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:chatUserId', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT dms.*, u1.username as sender_name FROM dms JOIN users u1 ON dms.sender_id = u1.id WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND expires_at > datetime("now") ORDER BY created_at ASC',
      args: [req.user.id, req.params.chatUserId, req.params.chatUserId, req.user.id]
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
