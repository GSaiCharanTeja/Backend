/* ================= IMPORTS ================= */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

/* ================= APP SETUP ================= */
const app = express();
app.use(cors());
app.use(express.json());

/* ================= MONGODB CONNECTION ================= */
mongoose.connect(
  "mongodb+srv://gavidisaicharanteja_db_user:Sai3103@cartoon.ftvusod.mongodb.net/cartoonDB"
)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));


/* ================= MEMORY SCHEMA ================= */
const memorySchema = new mongoose.Schema({
    user: String,
    image: String,     // image1, image2, ...
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Memory = mongoose.model("Memory", memorySchema);

/* ================= LIKE SCHEMA ================= */
const likeSchema = new mongoose.Schema({
    user: String,
    image: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/* prevent duplicate likes */
likeSchema.index({ user: 1, image: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

/* ================= MEMORY APIs ================= */

/* SAVE MEMORY */
app.post("/api/memory", async (req, res) => {
    try {
        const { user, image, text } = req.body;

        if (!user || !image || !text) {
            return res.status(400).json({ message: "Missing data" });
        }

        const memory = new Memory({ user, image, text });
        await memory.save();

        res.status(201).json({ message: "Memory saved" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

/* GET MEMORY BY IMAGE */
app.get("/api/memory/:image", async (req, res) => {
    const data = await Memory.find({ image: req.params.image })
                             .sort({ createdAt: -1 });
    res.json(data);
});

/* ================= LIKE APIs ================= */

/* LIKE IMAGE */
app.post("/api/like", async (req, res) => {
    try {
        const { user, image } = req.body;

        if (!user || !image) {
            return res.status(400).json({ message: "Missing data" });
        }

        await Like.create({ user, image });
        res.status(201).json({ message: "Liked" });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Already liked" });
        }
        res.status(500).json({ message: "Server error" });
    }
});

/* GET LIKE COUNT */
app.get("/api/like/:image", async (req, res) => {
    const count = await Like.countDocuments({ image: req.params.image });
    res.json({ likes: count });
});

/* ================= START SERVER ================= */
app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
