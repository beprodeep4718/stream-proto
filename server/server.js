// server.js
import dotenv from "dotenv";
import express from "express";
import { StreamClient } from "@stream-io/node-sdk";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.STREAM_API_KEY;
const SECRET = process.env.STREAM_API_SECRET;

// Init server-side client
const client = new StreamClient(API_KEY, SECRET);

// Route to issue a token
app.post("/token", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  // Generate token valid for 1 hour
  const token = client.generateUserToken({ user_id: userId, validity_in_seconds: 3600 });

  res.json({ token });
});

app.listen(3001, () => console.log("Auth server running on http://localhost:3001"));
