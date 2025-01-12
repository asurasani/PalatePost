import mongoose from "mongoose";

export const createMockComment = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  user: new mongoose.Types.ObjectId(),
  post: new mongoose.Types.ObjectId(),
  text: "This is a comment",
  createdAt: new Date(),
  ...overrides,
});
