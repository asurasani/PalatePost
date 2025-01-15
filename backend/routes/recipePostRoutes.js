import express from "express";
import {
  getAllPosts,
  createRecipePost,
  deleteRecipePost,
} from "../controllers/recipePostController.js";
import RecipePost from "../models/RecipePost.js";

const router = express.Router();

// Middleware for validating request body
const validatePostBody = (req, res, next) => {
  const { title, user } = req.body;
  if (!title || !user) {
    return res.status(400).json({ message: "Title and user are required." });
  }
  next();
};

// Create a new post
router.post("/", async (req, res) => {
  try {
    const {
      user,
      title,
      recipe,
      imageUrl,
      likes,
      rating,
      comments,
      ingredients,
      steps,
      prepTime,
      cookTime,
      totalTime,
      servings,
      difficulty,
      mealType,
      views,
      isPublished,
      lastEditedAt,
    } = req.body;

    // Optional: Add inline validation if needed
    if (!user || !title || !recipe || !prepTime || !cookTime || !totalTime) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: user, title, recipe, prepTime, cookTime, totalTime.",
      });
    }

    // Create and save the recipe post
    const post = new RecipePost({
      user,
      title,
      recipe,
      imageUrl,
      likes,
      rating,
      comments,
      ingredients,
      steps,
      prepTime,
      cookTime,
      totalTime,
      servings,
      difficulty,
      mealType,
      views,
      isPublished,
      lastEditedAt,
    });

    const savedPost = await post.save();

    res.status(201).json({
      success: true,
      data: savedPost,
      message: "Post created successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the post.",
      error: err.message,
    });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await RecipePost.find();
    res.status(200).json({
      success: true,
      data: posts,
      message: "Posts retrieved successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving posts.",
      error: err.message,
    });
  }
});

//Get
export default router;
