// Mock User Data
export const mockUsers = [
  {
    _id: "64aefb123456789abcdef123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "password123",
    profileType: "Public",
    following: ["64aefb123456789abcdef124"],
  },
  {
    _id: "64aefb123456789abcdef124",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    password: "password456",
    profileType: "Private",
    following: [],
  },
];

// Mock Recipe Posts
export const mockRecipePosts = [
  {
    _id: "6780a11269c8e7f9fb55ca8c",
    user: "64aefb123456789abcdef123",
    title: "Spaghetti Bolognese",
    recipe: "Cook pasta and sauce.",
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    ingredients: [
      { name: "Pasta", quantity: "200g" },
      { name: "Tomato Sauce", quantity: "100ml" },
    ],
    steps: [
      { stepNumber: 1, instruction: "Boil water." },
      { stepNumber: 2, instruction: "Cook pasta." },
    ],
  },
  {
    _id: "6780a11269c8e7f9fb55ca8d",
    user: "64aefb123456789abcdef124",
    title: "Pancakes",
    recipe: "Mix ingredients and fry.",
    prepTime: 5,
    cookTime: 10,
    totalTime: 15,
    ingredients: [
      { name: "Flour", quantity: "100g" },
      { name: "Milk", quantity: "200ml" },
    ],
    steps: [
      { stepNumber: 1, instruction: "Mix ingredients." },
      { stepNumber: 2, instruction: "Cook on pan." },
    ],
  },
];
