import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  expect,
  vi,
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User";
import RecipePost from "../models/RecipePost";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getFollowedUsersPosts,
} from "../controllers/userController";
import { createMockUser } from "./mocks/mockUserFactory";
import { createMockRecipePost } from "./mocks/mockRecipePostFactory";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

vi.mock("../models/RecipePost", () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
  },
}));

describe("User Controller Tests", () => {
  it("should get all users", async () => {
    //Arrange
    await User.create(createMockUser());
    await User.create(createMockUser({ firstName: "Jane" }));
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await getAllUsers(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0]).toHaveLength(2);
  });
  it("should get a user by id", async () => {
    //Arrange
    const user = await User.create(createMockUser({ firstName: "John" }));
    const req = { params: { id: user._id.toString() } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await getUserById(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data).toMatchObject({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  });

  it("should return a 404 if no user found", async () => {
    //Arrange
    const req = { params: { id: "64aefb123456449abcdef123" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await getUserById(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: "User not found",
    });
  });

  it("should create a new user", async () => {
    //Arrange
    const req = { body: createMockUser({ email: "john@example.com" }) };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await createUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      message: "User created successfully",
    });
  });
  it("should return a 400 if required fields are missing", async () => {
    //Arrange
    const req = { body: { firstName: "John", email: "john@example.com" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await createUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: "Missing required fields",
    });
  });

  it("should return a 409 if email already exists", async () => {
    //Arrange
    await User.create(createMockUser({ email: "john@example.com" }));
    const req = { body: createMockUser({ email: "john@example.com" }) };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await createUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: "Email already registered",
    });
  });

  it("should update a user", async () => {
    //Arrange
    const user = await User.create(createMockUser({ firstName: "John" }));
    const req = {
      params: { id: user._id.toString() },
      body: { email: "newemail@example.com" },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await updateUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      message: "User updated successfully",
    });
  });

  it("should return a 400 for invalid update", async () => {
    //Arrange
    const user = await User.create(createMockUser({ firstName: "John" }));
    const req = {
      params: { id: user._id.toString() },
      body: { something: "bling" },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await updateUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message:
        "Invalid updates. Allowed fields: name, email, password, profile",
    });
  });

  it("should delete a user", async () => {
    //Arrange
    const user = await User.create(createMockUser({ firstName: "John" }));
    const req = { params: { id: user._id.toString() } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await deleteUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      message: "User deleted successfully",
    });
  });

  it("should return a 404 if user not found", async () => {
    //Arrange
    const req = { params: { id: "64aefb123456449abcdef123" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await deleteUser(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: "User not found",
    });
  });
});

describe("Followed Users Tests", () => {
  it("should return empty data if no followed users", async () => {
    //Arrange
    const user = await User.create(createMockUser({ firstName: "John" }));
    const req = { params: { id: user._id.toString() } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await getFollowedUsersPosts(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      message: "User follows no one",
    });
  });

  it("should return followed users posts with default pagination", async () => {
    const mockRequest = {
      params: {
        id: new mongoose.Types.ObjectId(),
      },
      query: {},
    };

    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    // Create mock followed users
    const followedUser1 = createMockUser();
    const followedUser2 = createMockUser();

    // Create mock user with following
    const mockUser = createMockUser({
      following: [followedUser1._id, followedUser2._id],
    });

    // Create mock posts
    const mockPosts = [
      createMockRecipePost({ user: followedUser1._id }),
      createMockRecipePost({ user: followedUser2._id }),
    ];

    // Setup mocks
    User.findById = vi.fn().mockResolvedValue(mockUser);
    RecipePost.find = vi.fn().mockReturnThis();
    RecipePost.populate = vi.fn().mockReturnThis();
    RecipePost.sort = vi.fn().mockReturnThis();
    RecipePost.limit = vi.fn().mockReturnThis();
    RecipePost.skip = vi.fn().mockResolvedValue(mockPosts);

    await getFollowedUsersPosts(mockRequest, mockResponse);

    expect(RecipePost.find).toHaveBeenCalledWith({
      user: { $in: mockUser.following },
    });
    expect(RecipePost.populate).toHaveBeenCalledWith(
      "user",
      "firstName lastName"
    );
    expect(RecipePost.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(RecipePost.limit).toHaveBeenCalledWith(10);
    expect(RecipePost.skip).toHaveBeenCalledWith(0);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockPosts,
    });
  });
});
