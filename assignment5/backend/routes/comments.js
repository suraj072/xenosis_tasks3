const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

// Create a comment
router.post("/", auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const newComment = new Comment({
      content,
      author: req.user.id,
      post: postId,
    });
    const comment = await newComment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get comments for a post
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({
      date: -1,
    });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update a comment
router.put("/:id", auth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    const { content } = req.body;
    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete a comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await comment.remove();
    res.json({ msg: "Comment removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
