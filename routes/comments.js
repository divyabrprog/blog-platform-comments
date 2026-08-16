const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get comments for a post
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message
    });
  }
});

// Add a comment
router.post("/post/:postId", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Comment content is required"
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comment = await Comment.create({
      content,
      author: req.userId,
      post: req.params.postId
    });

    const populatedComment = await comment.populate(
      "author",
      "name email"
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message
    });
  }
});

// Delete your own comment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete your own comments"
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message
    });
  }
});

module.exports = router;
