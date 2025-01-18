import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import RecipePost from "../models/RecipePost";
import User from "../models/User";
import {
  getAllPosts,
  createRecipePost,
  deleteRecipePost,
} from "../controllers/recipePostController"; // Adjusted to use the service layer
import { createMockRecipePost } from "./mocks/mockRecipePostFactory";

let mongoServer;

// Connect to in-memory database before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all data after each test
beforeEach(async () => {
  await RecipePost.deleteMany({});
  await User.deleteMany({});
});

// Disconnect and close server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Service Tests
describe("RecipePost Service Tests", () => {
  describe("createRecipePost", () => {
    it("should create a new recipe post", async () => {
      const mockRecipe = createMockRecipePost();

      // Mock the `save` method
      RecipePost.prototype.save = vi.fn().mockResolvedValue({
        ...mockRecipe,
        _id: new mongoose.Types.ObjectId(),
      });

      const savedPost = await createRecipePost(mockRecipe);

      expect(savedPost).toHaveProperty("_id");
      expect(savedPost.title).toBe(mockRecipe.title);
      expect(RecipePost.prototype.save).toHaveBeenCalledTimes(1);
    });

    it("should handle missing required fields", async () => {
      const incompleteRecipe = { title: "Incomplete Recipe" };

      await expect(createRecipePost(incompleteRecipe)).rejects.toThrow(
        "Missing required fields: user, title, recipe, prepTime, cookTime, totalTime"
      );
    });
  });

  describe("getAllPosts", () => {
    it("should get all public posts", async () => {
      const mockUser = new User({
        firstName: "John",
        lastName: "Doe",
        profileType: "Public",
        email: "john@example.com",
        password: "password123",
        following: [],
      });
      await mockUser.save();

      const mockRecipe = createMockRecipePost({ user: mockUser._id });
      await RecipePost.create(mockRecipe);

      const posts = await getAllPosts(mockUser._id);

      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe(mockRecipe.title);
    });

    it("should throw an error if the user is not found", async () => {
      const invalidUserId = new mongoose.Types.ObjectId();

      await expect(getAllPosts(invalidUserId)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("deleteRecipePost", () => {
    it("should delete an existing recipe post", async () => {
      const mockUser = new User({
        firstName: "John",
        lastName: "Doe",
        profileType: "Public",
        email: "john@example.com",
        password: "password123",
      });
      await mockUser.save();

      const mockRecipe = createMockRecipePost({ user: mockUser._id });
      const savedPost = await RecipePost.create(mockRecipe);

      const result = await deleteRecipePost(savedPost._id.toString());

      expect(result.postId).toEqual(savedPost._id);
      expect(result.title).toEqual(savedPost.title);

      const deletedPost = await RecipePost.findById(savedPost._id);
      expect(deletedPost).toBeNull();
    });

    it("should throw an error if the post ID is invalid", async () => {
      const invalidId = "invalid-id";

      await expect(deleteRecipePost(invalidId)).rejects.toThrow(
        "Invalid post ID format"
      );
    });

    it("should throw an error if the post is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(deleteRecipePost(nonExistentId)).rejects.toThrow(
        "Recipe post not found"
      );
    });
  });
});
