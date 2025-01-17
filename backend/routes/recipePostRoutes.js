import express from "express";
import {
  getAllPosts,
  createRecipePost,
  deleteRecipePost,
} from "../controllers/recipePostController.js";
import RecipePost from "../models/RecipePost.js";

const router = express.Router();

// Create a new post
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure `data` contains all the required fields
    console.log("Request body:", data);

    const savedPost = await createRecipePost(data);

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
