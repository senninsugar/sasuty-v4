const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
require('./cron/cleanup');

const authRoutes = require('./controllers/authController');
const postRoutes = require('./controllers/postController');
const dmRoutes = require('./controllers/dmController');
const adminRoutes = require('./controllers/adminController');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: '*' }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/dm', (req, res) => res.render('dm'));
app.get('/profile', (req, res) => res.render('profile'));
app.get('/admin', (req, res) => res.render('admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
