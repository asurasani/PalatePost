import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import RecipePost from "../models/RecipePost";
import User from "../models/User";
import {
  getAllPosts,
  createRecipePost,
  deleteRecipePost,
} from "../controllers/recipePostController";

let mongoServer;

// Mock data
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  firstName: "John",
  lastName: "Doe",
  profileType: "Public",
  email: "john@example.com",
  password: "password123",
  following: [],
};

const mockRecipe = {
  user: mockUser._id,
  title: "Chocolate Cake",
  recipe: "A delicious chocolate cake recipe",
  ingredients: [
    { name: "flour", quantity: "2 cups" },
    { name: "sugar", quantity: "1 cup" },
  ],
  steps: [
    { stepNumber: 1, instruction: "Mix dry ingredients" },
    { stepNumber: 2, instruction: "Add wet ingredients" },
  ],
  prepTime: 15,
  cookTime: 45,
  totalTime: 60,
  servings: 8,
  difficulty: "Medium",
  mealType: "Dessert",
};

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

describe("RecipePost Model Tests", () => {
  it("should create a recipe post successfully", async () => {
    const validRecipePost = new RecipePost(mockRecipe);
    const savedRecipePost = await validRecipePost.save();

    expect(savedRecipePost._id).toBeDefined();
    expect(savedRecipePost.title).toBe(mockRecipe.title);
    expect(savedRecipePost.difficulty).toBe(mockRecipe.difficulty);
  });

  it("should fail validation when required fields are missing", async () => {
    const invalidRecipe = new RecipePost({
      title: "Invalid Recipe",
      // Missing required fields
    });

    await expect(invalidRecipe.save()).rejects.toThrow();
  });

  it("should enforce enum values for difficulty", async () => {
    const invalidDifficulty = new RecipePost({
      ...mockRecipe,
      difficulty: "Super Hard", // Invalid difficulty
    });

    await expect(invalidDifficulty.save()).rejects.toThrow();
  });

  it("should enforce enum values for mealType", async () => {
    const invalidMealType = new RecipePost({
      ...mockRecipe,
      mealType: "Midnight Snack", // Invalid meal type
    });

    await expect(invalidMealType.save()).rejects.toThrow();
  });
});

describe("Recipe Controller Tests", () => {
  describe("getAllPosts", () => {
    it("should get all public posts", async () => {
      // Create a test user
      const user = await User.create({
        ...mockUser,
        profileType: "Public",
      });

      // Create some test posts
      await RecipePost.create({
        ...mockRecipe,
        user: user._id,
      });

      const req = {
        user: { id: user._id },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getAllPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
    });
  });

  describe("createRecipePost", () => {
    it("should create a new recipe post", async () => {
      const req = {
        body: mockRecipe,
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createRecipePost(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.title).toBe(mockRecipe.title);
    });

    it("should handle missing required fields", async () => {
      const req = {
        body: {
          title: "Incomplete Recipe",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createRecipePost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });
  });

  describe("deleteRecipePost", () => {
    it("should delete an existing recipe post", async () => {
      // First create a user
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        profileType: "Public",
      });

      // Create a post to delete with the user reference
      const post = await RecipePost.create({
        ...mockRecipe,
        user: user._id, // Set the user reference
      });

      const req = {
        params: { id: post._id.toString() },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await deleteRecipePost(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.postId.toString()).toBe(post._id.toString());

      // Verify post is actually deleted
      const deletedPost = await RecipePost.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it("should handle invalid post ID format", async () => {
      const req = {
        params: { id: "invalid-id" },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await deleteRecipePost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });
  });
});

// Integration Tests
describe("Recipe Integration Tests", () => {
  it("should create and then retrieve a recipe post", async () => {
    // Create a test user
    const user = await User.create(mockUser);

    // Create a recipe post
    const newRecipe = await RecipePost.create({
      ...mockRecipe,
      user: user._id,
    });

    // Retrieve the post
    const retrievedRecipe = await RecipePost.findById(newRecipe._id).populate(
      "user",
      "firstName lastName"
    );

    expect(retrievedRecipe.title).toBe(mockRecipe.title);
    expect(retrievedRecipe.user.firstName).toBe(mockUser.firstName);
  });

  it("should handle the complete recipe lifecycle", async () => {
    // Create
    const recipe = await RecipePost.create(mockRecipe);
    expect(recipe._id).toBeDefined();

    // Update
    recipe.title = "Updated Recipe";
    await recipe.save();
    const updated = await RecipePost.findById(recipe._id);
    expect(updated.title).toBe("Updated Recipe");

    // Delete
    await RecipePost.findByIdAndDelete(recipe._id);
    const deleted = await RecipePost.findById(recipe._id);
    expect(deleted).toBeNull();
  });
});
