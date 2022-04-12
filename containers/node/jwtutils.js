const jwt = require('jsonwebtoken');

const JWT_SECRET = '1050db049ff7fdfba85e583303da60b8'; // secret key for jwt

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided.'
    });
  }
  
  try {
    console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Failed to authenticate token.' 
    });
  }
};

exports.JWT_SECRET = JWT_SECRET;
exports.verifyToken = verifyToken;
