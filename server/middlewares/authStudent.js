// middleware/authStudent.js
import jwt from 'jsonwebtoken';

const authStudent = (req, res, next) => {
  try {
    const token = req.cookies?.Studentlogintoken;

    if (!token) {
      // Clear any invalid cookies
      res.clearCookie('Studentlogintoken', req.app.locals.cookieConfig);
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code: 'TOKEN_MISSING'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        throw new Error('Invalid token payload');
      }

      // Set user ID for use in route handlers
      req.StudentId = decoded.id;

      // Check if token is nearing expiration (e.g., less than 1 day remaining)
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn < 24 * 60 * 60) {
        // Generate new token
        const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('Studentlogintoken', newToken, req.app.locals.cookieConfig);
      }

      next();
    } catch (jwtError) {
      // Clear invalid token
      res.clearCookie('Studentlogintoken', req.app.locals.cookieConfig);
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_INVALID'
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

export default authStudent;
