// middleware/authVendor.js
import jwt from 'jsonwebtoken';

const authVendor = (req, res, next) => {
  let token = req.cookies?.Vendorlogintoken;

  // fallback to Authorization header
  if (!token && req.headers.authorization) {
    const bearer = req.headers.authorization.split(' ');
    if (bearer[0] === 'Bearer' && bearer[1]) {
      token = bearer[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.VendorId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default authVendor;
