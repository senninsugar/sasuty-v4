const cron = require('node-cron');
const db = require('../config/database');

cron.schedule('0 * * * *', async () => {
  try {
    await db.execute({
      sql: 'DELETE FROM dms WHERE expires_at <= datetime("now")',
      args: []
    });
  } catch (err) {
    console.error(err);
  }
});
