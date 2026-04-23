const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ✅ CONNECT TO MONGODB (uses Render env)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo ERROR:", err));

// schema
const keySchema = new mongoose.Schema({
  key: String,
  device: { type: String, default: null }
});

const Key = mongoose.model("Key", keySchema);

// ✅ CHECK KEY
app.post("/check", async (req, res) => {
  try {
    const { key, device } = req.body;

    if (!key) {
      return res.json({ success: false });
    }

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

    // same device
    if (found.device === device) {
      return res.json({ success: true });
    }

    // different device
    return res.json({ success: false });

  } catch (err) {
    console.log("CHECK ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

// test route
app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
