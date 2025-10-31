const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../database/db');

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    // Check if email exists
    const existingUser = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Users (username, email, password)
        VALUES (@username, @email, @password)
      `);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
