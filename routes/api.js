const express = require("express");
const router = express.Router();

const db = require("../db/database"); // opens the connection for the following routers

const answersRouter = require("./routers/answers");
const questionsRouter = require("./routers/questions");
const searchRouter = require("./routers/search");
const userRouter = require("./routers/users");
const commentRouter = require("./routers/comments");

router.use([
  questionsRouter,
  answersRouter,
  searchRouter,
  userRouter,
  commentRouter
]);

module.exports = router;
