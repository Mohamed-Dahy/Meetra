const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = { id: user._id, user };
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ message: "Not authorized, invalid or expired token" });
  }
};

module.exports = { protect };

