const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');



function protectAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authorized. Please login.');
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { adminId, email, role }
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token.'));
  }
}

module.exports = { protectAdmin };
