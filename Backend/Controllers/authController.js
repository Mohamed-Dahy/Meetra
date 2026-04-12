const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password ,dateOfBirth, gender, bio, interests} = req.body;
  if(!name || !email || !password || !dateOfBirth || !gender ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existingUser = await User.findOne({ email });
  if(existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, dateOfBirth, gender, bio, interests });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.status(201).json({ message: "User registered successfully, your token will last for 1 day", user, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.log(error);
    }
  
  
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ message: "User logged in successfully, your token will last for 1 day", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getUsers = async (req, res) => {
  try {
    const { search = '', limit = 20 } = req.query;
    const cap = Math.min(parseInt(limit, 10) || 20, 50); // hard cap at 50

    // Build query — if search is provided, match name or email case-insensitively.
    // Using a regex on indexed fields is acceptable for small-to-medium user bases.
    const filter = search.trim()
      ? {
          $or: [
            { name:  { $regex: search.trim(), $options: 'i' } },
            { email: { $regex: search.trim(), $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(filter).select("-password").limit(cap);
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, interests, dateOfBirth, gender } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name cannot be empty" });
      user.name = name.trim();
    }
    if (bio !== undefined) user.bio = bio;
    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests
        : interests.split(",").map(i => i.trim()).filter(Boolean);
    }
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) {
      if (!["male", "female", "other"].includes(gender))
        return res.status(400).json({ message: "Invalid gender value" });
      user.gender = gender;
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.status(200).json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "currentPassword and newPassword are required" });

    if (newPassword.length < 5)
      return res.status(400).json({ message: "New password must be at least 5 characters" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser, getUsers, getMe, updateProfile, changePassword };