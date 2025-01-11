import mongoose from "mongoose";
import { Schema } from "mongoose";

const recipePostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  recipe: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
    required: true,
  },
  rating: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  ingredients: [
    {
      name: String,
      quantity: String,
    },
  ],
  steps: [
    {
      stepNumber: Number,
      instruction: String,
    },
  ],
  prepTime: {
    type: Number,
    required: true,
  },
  cookTime: {
    type: Number,
    required: true,
  },
  totalTime: {
    type: Number,
    required: true,
  },
  servings: {
    type: Number,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
  },
  mealType: {
    type: String,
    enum: [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
      "Dessert",
      "Brunch",
      "Other",
    ],
  },
  views: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  lastEditedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RecipePost = mongoose.model("RecipePost", recipePostSchema);
export default RecipePost;
