import jwt from "jsonwebtoken";

export default function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Remove 'Bearer ' if present
    const actualToken = token.startsWith("Bearer ")
      ? token.slice(7).trim()
      : token;

    // Verify token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
}
