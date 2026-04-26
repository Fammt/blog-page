require('dotenv').config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "mysecretkey";

const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("blogDB");
        console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}

connectDB();


// =======================
// AUTH ROUTES
// =======================

app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ username, password: hashedPassword });
    res.send("User created successfully!");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(400).send("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Wrong password");
    const token = jwt.sign({ userId: user._id }, SECRET);
    res.json({ token });
});


// =======================
// AUTH MIDDLEWARE
// =======================

function auth(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).send("No token");
    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).send("Invalid token");
    }
}


// =======================
// POSTS ROUTES
// =======================

// CREATE
app.post("/posts", auth, async (req, res) => {
    const { title, content } = req.body;
    await db.collection("posts").insertOne({
        title,
        content,
        userId: new ObjectId(req.userId),
        createdAt: new Date()
    });
    res.send("Post created");
});

// READ all posts — paginated, newest first
// GET /posts?page=1&limit=10
app.get("/posts", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await db.collection("posts").countDocuments();

        const posts = await db.collection("posts")
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const postsWithAuthors = await Promise.all(posts.map(async (post) => {
            const user = await db.collection("users").findOne({ _id: post.userId });
            return {
                ...post,
                authorUsername: user ? user.username : "Unknown"
            };
        }));

        res.json({
            posts: postsWithAuthors,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + posts.length < total
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send("Error fetching posts");
    }
});

// UPDATE
app.put("/posts/:id", auth, async (req, res) => {
    const { title, content } = req.body;
    const userId = new ObjectId(req.userId);
    const postId = new ObjectId(req.params.id);

    const result = await db.collection("posts").updateOne(
        { _id: postId, userId: userId },
        { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
        return res.status(404).send("Post not found or you don't own it");
    }
    res.send("Post updated");
});

// DELETE
app.delete("/posts/:id", auth, async (req, res) => {
    const userId = new ObjectId(req.userId);
    const postId = new ObjectId(req.params.id);

    const result = await db.collection("posts").deleteOne({
        _id: postId,
        userId: userId
    });

    if (result.deletedCount === 0) {
        return res.status(404).send("Post not found or you don't own it");
    }
    res.send("Post deleted");
});

// GET my posts (profile page) — newest first
app.get("/my-posts", auth, async (req, res) => {
    try {
        const userId = new ObjectId(req.userId);
 
        const posts = await db.collection("posts")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
 
        const user = await db.collection("users").findOne({ _id: userId });
 
        const postsWithAuthor = posts.map(post => ({
            ...post,
            authorUsername: user ? user.username : "You"
        }));
 
        res.json(postsWithAuthor);
    } catch (err) {
        console.error("Error fetching your posts:", err);
        res.status(500).send("Error fetching your posts");
    }
});

// =======================
// FAVORITES ROUTES
// =======================

app.post("/favorites/:postId", auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = new ObjectId(req.userId);

        const existing = await db.collection("favorites").findOne({ userId, postId });
        if (existing) return res.status(400).send("Already favorited");

        await db.collection("favorites").insertOne({
            userId,
            postId,
            createdAt: new Date()
        });

        res.send("Favorite added");
    } catch (err) {
        console.error("Error adding favorite:", err);
        res.status(500).send("Error adding favorite");
    }
});

app.delete("/favorites/:postId", auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = new ObjectId(req.userId);

        const result = await db.collection("favorites").deleteOne({ userId, postId });
        if (result.deletedCount === 0) return res.status(404).send("Favorite not found");

        res.send("Favorite removed");
    } catch (err) {
        console.error("Error removing favorite:", err);
        res.status(500).send("Error removing favorite");
    }
});

app.get("/favorites", auth, async (req, res) => {
    try {
        const userId = new ObjectId(req.userId);

        const favorites = await db.collection("favorites").find({ userId }).toArray();
        if (favorites.length === 0) return res.json([]);

        const postIds = favorites.map(fav => new ObjectId(fav.postId));
        const posts = await db.collection("posts")
            .find({ _id: { $in: postIds } })
            .sort({ createdAt: -1 })
            .toArray();

        const postsWithAuthors = await Promise.all(posts.map(async (post) => {
            const user = await db.collection("users").findOne({ _id: post.userId });
            return { ...post, authorUsername: user ? user.username : "Unknown" };
        }));

        res.json(postsWithAuthors);
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).send("Error fetching favorites");
    }
});

app.get("/favorites/check/:postId", auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = new ObjectId(req.userId);
        const favorite = await db.collection("favorites").findOne({ userId, postId });
        res.json({ isFavorited: !!favorite });
    } catch (err) {
        console.error("Error checking favorite:", err);
        res.status(500).send("Error checking favorite");
    }
});


// =======================
// DELETE ACCOUNT
// =======================

app.delete("/delete-account", auth, async (req, res) => {
    try {
        const userId = new ObjectId(req.userId);
        await db.collection("posts").deleteMany({ userId });
        await db.collection("favorites").deleteMany({ userId });
        const result = await db.collection("users").deleteOne({ _id: userId });
        if (result.deletedCount === 0) return res.status(404).send("User not found");
        res.send("Account deleted successfully");
    } catch (err) {
        console.error("Error deleting account:", err);
        res.status(500).send("Error deleting account");
    }
});


// =======================
// START SERVER
// =======================

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});