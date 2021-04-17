const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} = require("../controllers/feed");

// GET /feed/posts
router.get("/posts", isAuth, getPosts);

// POST /feed/post
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }).blacklist("$#@^&"),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  createPost
);

// GET /feed/post/postId
router.get("/post/:postId", isAuth, getPost);

// PUT /feed/post/postId
router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }).blacklist("$#@^&"),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  updatePost
);

// DELETE /feed/post/postId
router.delete("/post/:postId", isAuth, deletePost);

module.exports = router;
