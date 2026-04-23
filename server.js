require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// schema
const keySchema = new mongoose.Schema({
  key: String,
  device: { type: String, default: null }
});

const Key = mongoose.model("Key", keySchema);

// ✅ THIS IS THE IMPORTANT PART
app.post("/check", async (req, res) => {
  const { key, device } = req.body;

  const found = await Key.findOne({ key });

  if (!found) {
    return res.json({ success: false });
  }

  if (!found.device) {
    found.device = device;
    await found.save();
    return res.json({ success: true });
  }

  if (found.device === device) {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// test route
app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
