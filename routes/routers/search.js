const express = require("express");
const router = express.Router();
const {
  ErrorHandler,
  processValidationErrors
} = require("../../helpers/error");
const {
  sanitizeQuery,
  sanitizeParam,
  sanitizeBody,
  query,
  param,
  body
} = require("express-validator");
const Question = require("../../models/Question");

router.get(
  "/search",
  sanitizeQuery("skip").toInt(),
  sanitizeQuery("category").escape(),
  query("tags")
    .optional({ checkFalsy: true })
    .isArray(),
  query("sort")
    .escape()
    .optional({ checkFalsy: true })
    .isIn(["votes", "views", "createdAt"]),
  query("order")
    .escape()
    .optional({ checkFalsy: true })
    .isIn(["asc", "desc"]),
  query("fromdate")
    .escape()
    .optional({ checkFalsy: true })
    .isISO8601(),
  query("todate")
    .escape()
    .optional({ checkFalsy: true })
    .isISO8601(),
  query("q")
    .escape()
    .exists(),
  processValidationErrors,
  (req, res, next) => {
    let question = new Question();
    req.query.includeAnswers = true;
    req.query.searchText = req.query.q;
    question
      .getQuestions(req.query)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

module.exports = router;
