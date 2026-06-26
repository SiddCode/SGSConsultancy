const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_PASSWORD || 'SgsHr2026!';

    // Basic admin auth validation (since we only have a single admin account set via config)
    if (username !== envUsername || password !== envPassword) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      admin: {
        username: envUsername
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sgs_hr_workforce_solutions_secret_key_2026',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, username: envUsername });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
