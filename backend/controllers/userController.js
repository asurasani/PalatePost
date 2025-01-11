import User from "../models/User.js";
import RecipePost from "../models/RecipePost.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(201).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken"
    ); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const requiredFields = ["firstName", "lastName", "email", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new user
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      role: req.body.role || "user", // Default role
      isActive: true,
    });

    const savedUser = await user.save();

    // Remove sensitive data from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Check for empty request body
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // Define allowed fields for updating
    const allowedUpdates = ["name", "email", "password", "profile"];
    const updates = Object.keys(req.body);

    // Validate update fields
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: `Invalid updates. Allowed fields: ${allowedUpdates.join(
          ", "
        )}`,
      });
    }

    // Find user and verify existence
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If updating email, check if new email already exists
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Update user fields
    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    // If password is being updated, it will be hashed by the pre-save middleware
    const updatedUser = await user.save();

    // Remove sensitive fields from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (err) {
    // Handle specific error types
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Generic error handler
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getFollowedUsersPosts = async (req, res) => {
  try {
    //Fetch the user by id
    //access the users following array for user ids
    //fetch all posts by those ids
    //sort those posts by newest posts
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followingUsers = user.following;
    if (followingUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "User follows no one",
        data: [],
      });
    }

    const followedUserPosts = (
      await RecipePost.find({ _id: { $in: followingUsers } })
    )
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(req.query.limit || 10)
      .skip(req.query.skip || 0);

    return res.status(200).json({
      success: true,
      data: followedUserPosts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error getting followed users posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
