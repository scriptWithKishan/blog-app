type Request = import("express").Request;
type Response = import("express").Response;

const User = require("../../models/user");

const extractUserId = (req: Request) => {
  if (!req.user) return null;
  return typeof req.user === "object"
    ? req.user.user || req.user.id || req.user._id
    : req.user;
};

const getUserData = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);

    const userData = await User.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.status(200).json({
      message: "User data fetched successfully!",
      user: userData,
    });
  } catch (err: any) {
    console.error("Error in getUserData:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateUserData = async (req: Request, res: Response) => {
  try {
    const { username, bio } = req.body;
    const userId = extractUserId(req);

    if (!username) {
      return res.status(400).json({
        message: "Username is required!",
      });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username: username.trim(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username is already taken!",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: username.trim(),
          bio: bio !== undefined ? bio.trim() : "",
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.status(200).json({
      message: "User updated successfully!",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("Internal server error: ", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

module.exports = { getUserData, updateUserData };