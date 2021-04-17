const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} = require("../controllers/feed");

const router = express.Router();

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

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }).blacklist("$#@^&"),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  updatePost
);

router.delete("/post/:postId", isAuth, deletePost);
module.exports = router;
