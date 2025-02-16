import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { getParameter } from "../utils/getParameter.js";

let userPoolId;

try {
  userPoolId = await getParameter("/weatheryze/prod/backend/VITE_USER_POOL_ID");
} catch (error) {
  console.error("Error fetching env variables:", error);
  process.exit(1);
}

const client = jwksClient({
  jwksUri: `https://cognito-idp.us-east-2.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

export default function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Token is not valid" });

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  });
}
