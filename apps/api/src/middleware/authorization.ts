type Request = import("express").Request;
type Response = import("express").Response;
type NextFunction = import("express").NextFunction;

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const jwt = require("jsonwebtoken");

const authorization = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  
  if (!auth) {
    return res.status(400).json({
      message: "Unauthorized! No authorization header found",
    });
  }
  
  const token = auth.split(" ")[1];
  
  if (!token) {
    return res.status(400).json({
      message: "Unauthorized! Authorization token missing",
    });
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;

    next();
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authorization;
