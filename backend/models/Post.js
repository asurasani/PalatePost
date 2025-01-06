import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  recipe: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model("Post", PostSchema);
