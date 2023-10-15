const jwt = require('jsonwebtoken');
const secret_key = 'this is my secret key';

function auth(req, res, next) {
  const token = req.headers.authorization;
//   console.log(req.headers);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, secret_key, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = {auth};