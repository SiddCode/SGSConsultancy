const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Get token from header or cookies
  let token = req.header('Authorization');
  
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
    // Also check query param or body as fallback for download routes if needed
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sgs_hr_workforce_solutions_secret_key_2026');
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
