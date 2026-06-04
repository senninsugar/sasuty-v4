const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, parent_id, is_repost } = req.body;
    await db.execute({
      sql: 'INSERT INTO posts (user_id, content, parent_id, is_repost) VALUES (?, ?, ?, ?)',
      args: [req.user.id, content || null, parent_id || null, is_repost ? 1 : 0]
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT posts.*, users.username FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    await db.execute({
      sql: 'UPDATE posts SET views = views + 1 WHERE id = ?',
      args: [postId]
    });
    const result = await db.execute({
      sql: 'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?',
      args: [postId]
    });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    await db.execute({
      sql: 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      args: [req.user.id, req.params.id]
    });
    const post = await db.execute({ sql: 'SELECT user_id FROM posts WHERE id = ?', args: [req.params.id] });
    if (post.rows.length && post.rows[0].user_id !== req.user.id) {
      await db.execute({
        sql: 'INSERT INTO notifications (user_id, type, sender_id) VALUES (?, "like", ?)',
        args: [post.rows[0].user_id, req.user.id]
      });
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
