require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 🔌 Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 🔑 Key Schema
const keySchema = new mongoose.Schema({
  key: String,
  device: { type: String, default: null }
});

const Key = mongoose.model("Key", keySchema);

// ✅ CHECK KEY (THIS FIXES YOUR ERROR)
app.post("/check", async (req, res) => {
  try {
    const { key, device } = req.body;

    const found = await Key.findOne({ key });

    if (!found) {
      return res.json({ success: false });
    }

    // first time use → bind device
    if (!found.device) {
      found.device = device;
      await found.save();
      return res.json({ success: true });
    }

    // same device → allow
    if (found.device === device) {
      return res.json({ success: true });
    }

    // different device → deny
    return res.json({ success: false });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false });
  }
});

// 🌐 Basic route (optional)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
