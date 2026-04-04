const User = require("../Models/userModel");

// ─── Send Connection Request ───────────────────────────────────────────────
const sendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot send to yourself
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Find target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find current user
    const currentUser = await User.findById(req.user.id);

    // Already connected
    if (currentUser.connections.includes(userId)) {
      return res.status(400).json({ message: "Already connected with this user" });
    }

    // Request already sent
    if (currentUser.sentRequests.includes(userId)) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    // Already received a request from this user — auto accept instead
    if (currentUser.receivedRequests.includes(userId)) {
      return res.status(400).json({ message: "This user already sent you a request. Accept it instead." });
    }

    // Push to sentRequests of current user
    currentUser.sentRequests.push(userId);
    await currentUser.save();

    // Push to receivedRequests of target user
    targetUser.receivedRequests.push(req.user.id);
    await targetUser.save();

    return res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("sendRequest error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Accept Connection Request ─────────────────────────────────────────────
const acceptRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the sender
    const senderUser = await User.findById(userId);
    if (!senderUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find current user
    const currentUser = await User.findById(req.user.id);

    // Check request exists in receivedRequests
    if (!currentUser.receivedRequests.includes(userId)) {
      return res.status(400).json({ message: "No connection request found from this user" });
    }

    // Remove from receivedRequests of current user
    currentUser.receivedRequests.pull(userId);

    // Remove from sentRequests of sender
    senderUser.sentRequests.pull(req.user.id);

    // Add to connections of both users
    currentUser.connections.push(userId);
    senderUser.connections.push(req.user.id);

    // Save both
    await currentUser.save();
    await senderUser.save();

    return res.status(200).json({ message: "Connection request accepted" });
  } catch (error) {
    console.error("acceptRequest error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Reject Connection Request ─────────────────────────────────────────────
const rejectRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the sender
    const senderUser = await User.findById(userId);
    if (!senderUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find current user
    const currentUser = await User.findById(req.user.id);

    // Check request exists
    if (!currentUser.receivedRequests.includes(userId)) {
      return res.status(400).json({ message: "No connection request found from this user" });
    }

    // Remove from receivedRequests of current user
    currentUser.receivedRequests.pull(userId);

    // Remove from sentRequests of sender
    senderUser.sentRequests.pull(req.user.id);

    // Save both
    await currentUser.save();
    await senderUser.save();

    return res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("rejectRequest error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Remove Connection ─────────────────────────────────────────────────────
const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user.id);

    // Check they are actually connected
    if (!currentUser.connections.includes(userId)) {
      return res.status(400).json({ message: "You are not connected with this user" });
    }

    // Remove from both connections arrays
    currentUser.connections.pull(userId);
    targetUser.connections.pull(req.user.id);

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("removeConnection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get My Connections ────────────────────────────────────────────────────
const getMyConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate("connections", "name email _id bio");

    return res.status(200).json({ connections: currentUser.connections });
  } catch (error) {
    console.error("getMyConnections error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Received Requests ─────────────────────────────────────────────────
const getReceivedRequests = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate("receivedRequests", "name email _id bio");

    return res.status(200).json({ requests: currentUser.receivedRequests });
  } catch (error) {
    console.error("getReceivedRequests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Sent Requests ─────────────────────────────────────────────────────
const getSentRequests = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate("sentRequests", "name email _id bio");

    return res.status(200).json({ sentRequests: currentUser.sentRequests });
  } catch (error) {
    console.error("getSentRequests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  getMyConnections,
  getReceivedRequests,
  getSentRequests,
};