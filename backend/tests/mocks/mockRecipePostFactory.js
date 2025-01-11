export const createMockRecipePost = (overrides = {}) => ({
  _id: "64aefb" + Math.random().toString(16).slice(2, 14),
  user: "64aefb123456789abcdef123",
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
