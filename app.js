require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const chalk = require("chalk");
const path = require("path");
const multer = require("multer");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

// multer setup
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// DB Connection
mongoose.connect(
  "mongodb://localhost:27017/complete-rest-api",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      console.log(chalk.red("Problem while connecting :", err.message));
    }
  }
);
const db = mongoose.connection;
db.on("error", (err) => {
  console.log(chalk.red("Something went wrong in DB : ", err.message));
});
db.once("open", () => {
  console.log(chalk.blue("DB Connected"));
});

// Middleware
app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
// static serving
app.use("/images", express.static(path.join(__dirname, "images")));
// Handling CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// Error Handling
app.use((error, req, res, next) => {
  console.log(
    chalk.red(
      "\n <-----------------  Custom Error Handler Starts  ------------------> \n"
    )
  );
  console.log(error, "\n");
  console.log(
    chalk.red(
      "<-----------------  Custom Error Handler Finish  ------------------> \n"
    )
  );
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Server Listening
app.listen(8080, () =>
  console.log(chalk.blue("server listening on port 8080"))
);
