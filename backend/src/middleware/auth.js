import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ini bawaan lo yang lama (tetep dipertahanin biar rute lain aman)
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    // ✅ INI TAMBAHAN BARU BIAR KODINGAN CLAUDE JALAN:
    req.user = { 
      id: decoded.userId, 
      role: decoded.role 
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      // ✅ Tambahin juga di sini buat jaga-jaga
      req.user = { id: decoded.userId, role: decoded.role };
    } catch (error) {
      // Token invalid, continue without auth
    }
  }
  next();
};