const { pgQuery } = require('../db');

// Simple authentication middleware (no JWT)
const protect = async (req, res, next) => {
  try {
    // Get user ID from headers or query params
    const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
    
    console.log('=== PROTECT MIDDLEWARE (No JWT) ===');
    console.log('User ID from request:', userId);
    
    if (!userId) {
      // For development, you can use a default admin ID
      // Remove this in production
      console.log('No user ID provided, using default admin ID 12');
      req.user = { id: 12, name: 'Admin', role: 'admin' };
      return next();
    }
    
    // Get user from database
    const userResult = await pgQuery(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [parseInt(userId)]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = userResult.rows[0];
    console.log('User attached:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

const adminOnly = (req, res, next) => {
  console.log('=== ADMIN ONLY CHECK ===');
  console.log('User role:', req.user?.role);
  
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied');
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
};

module.exports = { protect, adminOnly };