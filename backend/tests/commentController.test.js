import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import RecipePost from "../models/RecipePost.js";
import {
  getPostComments,
  editComment,
  createComment,
  deleteComment,
} from "../controllers/commentController";
import { createMockUser } from "./mocks/mockUserFactory";
import { createMockComment } from "./mocks/mockCommentFactory";
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
  await Comment.deleteMany({});
  await User.deleteMany({});
  await RecipePost.deleteMany({});
  vi.clearAllMocks();
});

describe("Comment Controller Tests", () => {
  // Add your comment controller tests here
  it("Should create a comment", async () => {
    const user = await User.create(createMockUser());
    const post = await RecipePost.create(
      createMockRecipePost({ user: user._id })
    );

    const req = {
      params: { postId: post._id },
      body: { text: "test comment" },
      user: { id: user._id },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await createComment(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Comment created successfully",
      })
    );
  });

  it("Should edit a comment", async () => {
    //create a comment
    //edit the text of the comment with a new text
    //check the valid return

    //Arrange
    const comment = await Comment.create(createMockComment());

    const req = {
      params: { commentId: comment._id },
      body: { text: "Updated text" },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await editComment(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Comment updated successfully",
      })
    );
  });

  it("should delete a comment", async () => {
    // Arrange
    const mockComment = { _id: new mongoose.Types.ObjectId() };

    // Mock both findById and findByIdAndDelete
    vi.spyOn(Comment, "findById").mockResolvedValueOnce(mockComment);
    vi.spyOn(Comment, "findByIdAndDelete").mockResolvedValueOnce(mockComment);

    const req = {
      params: { commentId: mockComment._id },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Act
    await deleteComment(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Comment deleted successfully",
    });
  });

  it("should return 404 if comment not found", async () => {
    vi.spyOn(Comment, "findById").mockResolvedValueOnce(null);
    //Arrange
    const req = {
      params: { commentId: new mongoose.Types.ObjectId() },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Act
    await deleteComment(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Comment not found",
      })
    );
  });

  it("should return 400 if id not valid", async () => {
    //Arrange
    const req = {
      params: { commentId: "InvalidId" },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await deleteComment(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid comment ID",
      })
    );
  });

  it("should get the comments from a post", async () => {
    //create a post
    //create comment for the post
    //fetch the comment in the post

    //Arrange
    const post = await RecipePost.create(createMockRecipePost());
    const comment = await Comment.create(createMockComment({ post: post._id }));

    const req = {
      params: { postId: post._id },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    //Act
    await getPostComments(req, res);

    //Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
