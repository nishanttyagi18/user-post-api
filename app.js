const express = require("express");
const mongoose = require("mongoose");
const chalk = require("chalk");
const path = require("path");
const multer = require("multer");
const feedRoutes = require("./routes/feed");

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

app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

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

// static serving
app.use("/images", express.static(path.join(__dirname, "images")));

// Handling CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

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
  res.status(status).json({ message: message });
});

app.listen(8080, () =>
  console.log(chalk.blue("server listening on port 8080"))
);
