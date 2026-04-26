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

// MongoDB connection
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

// SIGNUP
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
        username,
        password: hashedPassword
    });

    res.send("User created sucessfully!");
});

// LOGIN
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
        userId: new ObjectId(req.userId)  // Convert to ObjectId
    });

    res.send("Post created");
});

// READ all posts (with author info)
app.get("/posts", async (req, res) => {
    try {
        const posts = await db.collection("posts").find().toArray();
        
        // Get user info for each post
        const postsWithAuthors = await Promise.all(posts.map(async (post) => {
            // post.userId is already an ObjectId (after fixing CREATE)
            const user = await db.collection("users").findOne({ _id: post.userId });
            return {
                ...post,
                authorUsername: user ? user.username : "Unknown"
            };
        }));
        
        res.json(postsWithAuthors);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send("Error fetching posts");
    }
});

// UPDATE
app.put("/posts/:id", auth, async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    
    // Convert both to ObjectId
    const userId = new ObjectId(req.userId);
    const postId = new ObjectId(id);

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
    const id = req.params.id;
    
    // Convert both to ObjectId for comparison
    const userId = new ObjectId(req.userId);
    const postId = new ObjectId(id);

    const result = await db.collection("posts").deleteOne({
        _id: postId,
        userId: userId
    });

    if (result.deletedCount === 0) {
        return res.status(404).send("Post not found or you don't own it");
    }

    res.send("Post deleted");
});

// GET posts by specific user (for Profile page)
app.get("/my-posts", auth, async (req, res) => {
    try {
        // Convert the string userId from token to ObjectId
        const userId = new ObjectId(req.userId);
        
        const posts = await db.collection("posts")
            .find({ userId: userId })
            .toArray();
        
        // Get the logged-in user's username
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

/* TEMPORARY - Delete all posts
app.get("/debug-delete-all-posts", async (req, res) => {
    try {
        const result = await db.collection("posts").deleteMany({});
        res.send(`Deleted ${result.deletedCount} posts`);
    } catch (err) {
        res.status(500).send("Error deleting posts");
    }
});*/

// ADD favorite (POST /favorites/:postId)
app.post("/favorites/:postId", auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = new ObjectId(req.userId);
        
        // Check if already favorited
        const existing = await db.collection("favorites").findOne({
            userId: userId,
            postId: postId
        });
        
        if (existing) {
            return res.status(400).send("Already favorited");
        }
        
        // Add to favorites collection
        await db.collection("favorites").insertOne({
            userId: userId,
            postId: postId,
            createdAt: new Date()
        });
        
        res.send("Favorite added");
    } catch (err) {
        console.error("Error adding favorite:", err);
        res.status(500).send("Error adding favorite");
    }
});

// REMOVE favorite (DELETE /favorites/:postId)
app.delete("/favorites/:postId", auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = new ObjectId(req.userId);
        
        const result = await db.collection("favorites").deleteOne({
            userId: userId,
            postId: postId
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).send("Favorite not found");
        }
        
        res.send("Favorite removed");
    } catch (err) {
        console.error("Error removing favorite:", err);
        res.status(500).send("Error removing favorite");
    }
});

// GET all favorited posts for logged-in user
app.get("/favorites", auth, async (req, res) => {
    try {
        const userId = new ObjectId(req.userId);
        
        // Get all favorite entries for this user
        const favorites = await db.collection("favorites")
            .find({ userId: userId })
            .toArray();
        
        if (favorites.length === 0) {
            return res.json([]);
        }
        
        // Get the actual post data for each favorite
        const postIds = favorites.map(fav => new ObjectId(fav.postId));
        const posts = await db.collection("posts")
            .find({ _id: { $in: postIds } })
            .toArray();
        
        // Add author info to each post
        const postsWithAuthors = await Promise.all(posts.map(async (post) => {
            const user = await db.collection("users").findOne({ _id: post.userId });
            return {
                ...post,
                authorUsername: user ? user.username : "Unknown"
            };
        }));
        
        res.json(postsWithAuthors);
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).send("Error fetching favorites");
    }
});

// CHECK if a specific post is favorited (optional, for UI)
app.get("/favorites/check/:postId", auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = new ObjectId(req.userId);
        
        const favorite = await db.collection("favorites").findOne({
            userId: userId,
            postId: postId
        });
        
        res.json({ isFavorited: !!favorite });
    } catch (err) {
        console.error("Error checking favorite:", err);
        res.status(500).send("Error checking favorite");
    }
});

// =======================
// DELETE ACCOUNT ROUTE
// =======================

app.delete("/delete-account", auth, async (req, res) => {
    try {
        const userId = new ObjectId(req.userId);
        
        // 1. Delete all posts by this user
        const postsResult = await db.collection("posts").deleteMany({ userId: userId });
        console.log(`Deleted ${postsResult.deletedCount} posts`);
        
        // 2. Delete all favorites by this user
        const favoritesResult = await db.collection("favorites").deleteMany({ userId: userId });
        console.log(`Deleted ${favoritesResult.deletedCount} favorites`);
        
        // 3. Delete the user account
        const userResult = await db.collection("users").deleteOne({ _id: userId });
        
        if (userResult.deletedCount === 0) {
            return res.status(404).send("User not found");
        }
        
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