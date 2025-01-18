import RecipePost from "../models/RecipePost.js";
import User from "../models/User.js";

/**
 * Get all posts for a user, including public posts and posts from followed users.
 * @param {String} userId The ID of the user making the request.
 * @returns {Array} An array of recipe posts.
 * @throws {Error} If there is an error fetching posts.
 */
export const getAllPosts = async (userId) => {
  try {
    // Get the user making the request
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error("User not found");
    }

    // Get public users
    const publicUsers = await User.find({ profileType: "Public" })
      .select("_id")
      .exec();

    // Get the IDs of users to fetch posts from
    const userIdsToFetch = [
      ...user.following,
      ...publicUsers.map((u) => u._id),
    ];

    // Fetch posts from the selected users
    const posts = await RecipePost.find({ user: { $in: userIdsToFetch } })
      .populate("user", "firstName lastName profileType")
      .sort({ createdAt: -1 })
      .exec();

    return posts;
  } catch (err) {
    throw new Error(`Error fetching posts: ${err.message}`);
  }
};

/**
 * Create a new recipe post.
 * @param {Object} data The recipe post data.
 * @returns {Object} The saved recipe post.
 * @throws {Error} If there is an error saving the recipe post.
 */
export const createRecipePost = async (data) => {
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
    } = data;

    // Validate required fields
    if (!user || !title || !recipe || !prepTime || !cookTime || !totalTime) {
      throw new Error(
        "Missing required fields: user, title, recipe, prepTime, cookTime, totalTime"
      );
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
    return await newRecipePost.save();
  } catch (err) {
    throw new Error(`Error creating recipe post: ${err.message}`);
  }
};

/**
 * Delete a recipe post by ID.
 * @param {String} id The ID of the recipe post to delete.
 * @returns {Object} An object with the deleted post's ID and title.
 * @throws {Error} If the recipe post is not found or there is an error deleting it.
 */
export const deleteRecipePost = async (id) => {
  try {
    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid post ID format");
    }

    // Find and delete the post
    const deletedPost = await RecipePost.findByIdAndDelete(id);

    if (!deletedPost) {
      throw new Error("Recipe post not found");
    }

    // Return the deleted post details
    return {
      postId: deletedPost._id,
      title: deletedPost.title,
    };
  } catch (err) {
    throw new Error(`Error deleting recipe post: ${err.message}`);
  }
};
