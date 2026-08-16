const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message
    });
  }
});

// Get one post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch post",
      error: error.message
    });
  }
});

// Create post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const post = await Post.create({
      title,
      content,
      author: req.userId
    });

    const populatedPost = await post.populate("author", "name email");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create post",
      error: error.message
    });
  }
});

// Update post
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only edit your own posts"
      });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    const updatedPost = await post.populate("author", "name email");

    res.json({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update post",
      error: error.message
    });
  }
});

// Delete post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete your own posts"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete post",
      error: error.message
    });
  }
});

module.exports = router;
