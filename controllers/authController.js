const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const showLogin = (req, res) => {
  const error = req.query.error || null;
  res.render('login.ejs', { error });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.redirect('/login?error=User Not Found');
  }

  const matchpss = await bcrypt.compare(password, user.password);
  if (matchpss) {
    const token = jwt.sign(
      { username: user.username, email: user.email, role: user.role },
      process.env.Jwt_secretKey,
    );
    res.cookie('token', token, { httpOnly: true });
    return res.redirect('/user/Medcines');
  }

  return res.redirect('/login?error=Please Enter Valid Cardinalties');
};

const showSignup = (req, res) => {
  res.render('signup.ejs', { error: null });
};

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render('signup.ejs', { massage: null, error: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.render('signup.ejs', { massage: null, error: 'Password must be at least 6 characters.' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render('signup.ejs', { error: 'User Already Exists' });
  }

  const hashedPss = await bcrypt.hash(password, 10);
  const reg = new User();
  reg.username = username;
  reg.email = email;
  reg.password = hashedPss;
  await reg.save();

  return res.redirect('/login');
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};

module.exports = {
  showLogin,
  login,
  showSignup,
  signup,
  logout,
};
