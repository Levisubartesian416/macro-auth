require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// KEY MODEL
const KeySchema = new mongoose.Schema({
    key: String,
    device: String
});

const Key = mongoose.model("Key", KeySchema);

// VERIFY KEY
app.post("/check", async (req, res) => {
    const { key, device } = req.body;

    const found = await Key.findOne({ key });

    if (!found) {
        return res.json({ success: false });
    }

    // first use → bind device
    if (!found.device) {
        found.device = device;
        await found.save();
        return res.json({ success: true });
    }

    // already bound
    if (found.device === device) {
        return res.json({ success: true });
    }

    return res.json({ success: false });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
