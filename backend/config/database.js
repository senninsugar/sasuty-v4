const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:sasuty.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const initDb = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      is_banned INTEGER DEFAULT 0,
      bio TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      parent_id INTEGER DEFAULT NULL,
      is_repost INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      post_id INTEGER,
      UNIQUE(user_id, post_id)
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER,
      following_id INTEGER,
      UNIQUE(follower_id, following_id)
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      message TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      sender_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
initDb();

module.exports = db;
