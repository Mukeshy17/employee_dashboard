import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// simple in-memory blacklist — persistent only while server runs
export const tokenBlacklist = new Set();
export const addToBlacklist = (token) => token && tokenBlacklist.add(token);

// Middleware to authenticate JWT token and attach user to req.user
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    // check blacklist
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ success: false, message: 'Token revoked' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Get fresh user data from database
    const [users] = await pool.execute(
      'SELECT id, name, email, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = users[0];
    req.token = token; // attach raw token for logout or auditing
    next();
  } catch (error) {
    console.error('auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

// Middleware to require admin privileges
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

// Factory to require ownership or admin for a resource (use inside route handlers)
export const requireOwnershipOrAdmin = (getResourceUserId) => {
  // getResourceUserId can be a function that accepts (req) and returns the owner user id
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);
      if (!resourceUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: resource owner not found'
        });
      }

      if (!req.user.is_admin && req.user.id !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('requireOwnershipOrAdmin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
