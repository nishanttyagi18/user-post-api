const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const User = require("../models/user");

// Getting All post Controller
exports.getPosts = async (req, res, next) => {
  // For pagination
  const currentPage = req.query.page;
  if (currentPage < 1) {
    const error = new Error("Enter a valid Page.");
    error.statusCode = 404;
    return next(error);
  }
  const perPage = 2;

  // Querying the database for posts
  try {
    const totalItem = await Post.find({}).countDocuments();

    let posts = await Post.find({})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    if (currentPage * perPage > totalItem) {
      return res.status(200).json({
        message: "This page don't have any post",
      });
    }
    res.status(200).json({
      message: "Posts Received Successfully",
      totalItem: totalItem,
      posts: posts,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Create Post Controller
exports.createPost = async (req, res, next) => {
  // Handling validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Entered data is not Correct.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  // Checking for image
  if (!req.file) {
    const error = new Error("No Image Provided.");
    error.statusCode = 422;
    return next(error);
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  // Saving Post to database
  try {
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
    });
    const savedPost = await post.save();

    // Updating user document -- pushing the newly created post
    const user = await User.findById(req.userId);
    user.posts.push(savedPost);
    console.log(user);
    const updatedUser = await user.save();

    // Sending the response
    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Get Single post Controller
exports.getPost = async (req, res, next) => {
  // Querying the database with postId from params
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Post received!",
      post: post,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Update post controller
exports.updatePost = async (req, res, next) => {
  // Handling validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Entered data is not Correct.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  // Checking for image
  if (!req.file) {
    const error = new Error("No Image Provided.");
    error.statusCode = 422;
    return next(error);
  }

  const imageUrl = req.file.path;

  // updating the post
  try {
    let post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find post");
      error.statusCode = 404;
      throw error;
    }

    // Authorizing the user
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorized.");
      error.statusCode = 403;
      next(error);
    }

    clearImage(post.imageUrl);

    const updatedPost = await Post.findByIdAndUpdate(
      { _id: postId },
      { title: title, content: content, imageUrl: imageUrl }
    );

    res.status(200).json({ message: "Post updated!", Post: updatedPost });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// delete post Controller
exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    // Checking for post in database
    let post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find post");
      error.statusCode = 404;
      throw error;
    }

    // Authorizing the user
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorized.");
      error.statusCode = 403;
      next(error);
    }

    clearImage(post.imageUrl);

    const deletedPost = await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    const deletedUser = await user.save();
    res.status(200).json({ message: "Post Deleted!", Post: deletedPost });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Logic for deleting Image from server/storage
const clearImage = (filePath) => {
  filePathToDelete = path.join(__dirname, "..", filePath);
  fs.unlink(filePathToDelete, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
