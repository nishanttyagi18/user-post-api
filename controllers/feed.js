const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page;
  if (currentPage < 1) {
    const error = new Error("Enter a valid Page.");
    error.statusCode = 404;
    return next(error);
  }
  const perPage = 2;
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

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Entered data is not Correct.");
    error.statusCode = 422;
    return next(error);
  }
  if (!req.file) {
    const error = new Error("No Image Provided.");
    error.statusCode = 422;
    return next(error);
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  try {
    // console.log(imageUrl);
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: { name: "Nishant" },
    });
    const savedPost = await post.save();
    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
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

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Entered data is not Correct.");
    error.statusCode = 422;
    return next(error);
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  if (!req.file) {
    const error = new Error("No Image Provided.");
    error.statusCode = 422;
    return next(error);
  }

  const imageUrl = req.file.path;

  try {
    let post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find post");
      error.statusCode = 404;
      throw error;
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

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    let post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find post");
      error.statusCode = 404;
      throw error;
    }

    clearImage(post.imageUrl);

    const deletedPost = await Post.findByIdAndRemove(postId);

    res.status(200).json({ message: "Post Deleted!", Post: deletedPost });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const clearImage = (filePath) => {
  filePathToDelete = path.join(__dirname, "..", filePath);
  fs.unlink(filePathToDelete, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
