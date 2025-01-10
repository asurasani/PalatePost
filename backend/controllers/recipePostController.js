import RecipePost from "../models/RecipePost.js";
import User from "../models/User.js";

/**
 * Get all public posts and posts from followed users
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} An object with a success boolean and an array of posts
 */
export const getAllPosts = async (req, res) => {
  try {
    // Get the logged-in user
    const userId = req.user.id;
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get public users
    const publicUsers = await User.find({ profileType: "Public" })
      .select("_id")
      .exec();

    // Get the IDs of users to fetch posts from (followed users and public users)
    const userIdsToFetch = [
      ...user.following,
      ...publicUsers.map((u) => u._id),
    ];

    // Fetch posts from the selected users
    const posts = await RecipePost.find({ user: { $in: userIdsToFetch } })
      .populate("user", "firstName lastName profileType") // Populate user details if needed
      .sort({ createdAt: -1 }) // Optional: Sort by newest first
      .exec();

    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Create a new recipe post
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} An object with a success boolean, message, and the created post
 */
export const createRecipePost = async (req, res) => {
  try {
    const {
      user,
      title,
      recipe,
      imageUrl,
      ingredients,
      steps,
      prepTime,
      cookTime,
      totalTime,
      servings,
      difficulty,
      mealType,
    } = req.body;

    // Validate required fields
    if (!user || !title || !recipe || !prepTime || !cookTime || !totalTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create the recipe post
    const newRecipePost = new RecipePost({
      user,
      title,
      recipe,
      imageUrl,
      ingredients,
      steps,
      prepTime,
      cookTime,
      totalTime,
      servings,
      difficulty,
      mealType,
    });

    // Save to the database
    const savedPost = await newRecipePost.save();

    return res.status(201).json({
      success: true,
      message: "Recipe post created successfully",
      data: savedPost,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error creating recipe post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Delete a recipe post by ID
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} An object with a success boolean, message, and the deleted post ID and title
 */
export const deleteRecipePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    // Find and delete the post
    const deletedPost = await RecipePost.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Recipe post not found",
      });
    }

    // Return the deleted post ID and title
    return res.status(200).json({
      success: true,
      message: "Recipe post deleted successfully",
      data: {
        postId: deletedPost._id,
        title: deletedPost.title,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting recipe post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
