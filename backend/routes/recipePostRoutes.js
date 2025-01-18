import express from "express";
import {
  getAllPosts,
  createRecipePost,
  deleteRecipePost,
} from "../controllers/recipePostController";

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = getAllPosts(req.user.id);
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Create a new recipe post
router.post("/", async (req, res) => {
  try {
    const savedPost = await createRecipePost(req.body);
    res.status(201).json({
      success: true,
      message: "Recipe post created successfully",
      data: savedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating recipe post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Delete a recipe post
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await deleteRecipePost(req.params.id);
    res.status(200).json({
      success: true,
      message: "Recipe post deleted successfully",
      data: deletedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting recipe post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;
