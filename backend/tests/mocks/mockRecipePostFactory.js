import mongoose from "mongoose";

export const createMockRecipePost = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  user: new mongoose.Types.ObjectId(),
  title: "Spaghetti Bolognese",
  likes: 3,
  recipe: "Cook pasta and sauce.",
  prepTime: "15 minutes",
  cookTime: "30 minutes",
  totalTime: "45 minutes",
  isPublished: true,
  createdAt: new Date(),
  lastEditedAt: new Date(),
  ...overrides,
});
