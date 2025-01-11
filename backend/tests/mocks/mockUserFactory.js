import mongoose from "mongoose";

export const createMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  firstName: "John",
  lastName: "Doe",
  email: `user${Math.random()}@example.com`,
  password: "password123",
  profileType: "Public",
  following: [],
  ...overrides,
});
