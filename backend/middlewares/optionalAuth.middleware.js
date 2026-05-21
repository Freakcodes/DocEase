// middleware/optionalAuth.js
import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  const token = req.headers.usertoken;

  if (!token) {
    req.userId = null;  // no token — guest user
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    req.userId = null;  // invalid/expired token — treat as guest
    next();             // still continue, don't reject
  }
};

export default optionalAuth;