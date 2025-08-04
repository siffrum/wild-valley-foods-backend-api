import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateAccessToken=async(user)=>{
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    return token;

}

const generateRefreshToken=async(user)=>{
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return token;

}

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json("Invalid token");
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(403).json("Token Expired");
      }
      req.user = decoded; // ✅ SET req.user
      next();
    });
  } catch (error) {
    return res.status(500).json("Token processing failed");
  }
};
  

export {
    generateAccessToken,generateRefreshToken,authenticateToken
}