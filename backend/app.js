import { config } from "dotenv";
config({ path: "./backend/.env" });
import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import postRoutes from "./routes/recipePostRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(json());

// MongoDB Connection
connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
