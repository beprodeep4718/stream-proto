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
const PORT = process.env.PORT || 3001;

if (!API_KEY || !SECRET) {
  console.error("Missing STREAM_API_KEY or STREAM_API_SECRET in environment.");
  process.exit(1);
}

// Init server-side client
const client = new StreamClient(API_KEY, SECRET);

// Route to issue a token
app.post("/token", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  try {
    // Generate token valid for 1 hour
    const token = client.generateUserToken({ user_id: userId, validity_in_seconds: 3600 });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));
