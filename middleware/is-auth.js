const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not Authenticated.");
    error.statusCode = 401;
    return next(error);
  }
  const token = authHeader.split(" ")[1];

  // Validating the Token
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    return next(err);
  }

  // Attaching the userId of loggedIn user to request object
  req.userId = decodedToken.userId;
  next();
};
