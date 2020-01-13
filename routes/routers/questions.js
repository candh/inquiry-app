const Comment = require("../../models/Comment");
const Delta = require("../../models/History").Delta;
const Question = require("../../models/Question");
const User = require("../../models/User");

const ejwt = require("express-jwt");
const express = require("express");

const process = require("process");
const keys = {
  jwtsecret: process.env.jwtsecret
};

const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
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

/*
  --------
  Create
  --------
*/

router.post(
  "/questions",
  ejwt({ secret: keys.jwtsecret }),
  body("title").isString(),
  body("body").isString(),
  body("tags").isArray(),
  body("category").exists(),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      title: req.body.title,
      body: req.body.body,
      tags: req.body.tags,
      category: req.body.category,
      user: req.user._id
    });
    question
      .createQuestion()
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Read
  --------
*/

// get all questions
// and much more :3
router.get(
  "/questions",
  sanitizeQuery("limit").toInt(),
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
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    question
      .getQuestions(req.query)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

// get one questions
router.get(
  "/questions/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({ _id: req.params.id });
    question
      .getQuestion()
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Update
  --------
*/

// propse a update to the questions
router.put(
  "/questions/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  body("title").isString(),
  body("body").isString(),
  body("tags").isArray(),
  body("category").exists(),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
      body: req.body.body,
      title: req.body.title,
      tags: req.body.tags,
      category: req.body.category
    });
    question
      .proposeUpdate(req.user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(err.statusCode || 500, err.message)));
  }
);

// approve an update to the questions
router.post(
  "/questions/edit/approve/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const delta = new Delta({
      _id: req.params.id
    });
    const question = new Question();
    question
      .approveUpdate(delta, req.user)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(err.statusCode || 500, err.message)));
  }
);

/*
  --------
  Delete
  --------
*/

router.delete(
  "/questions/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id
    });
    question
      .delete()
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(err.statusCode || 500, err.message)));
  }
);

/*
  --------
  Upvotes/Downvotes
  --------
*/

router.post(
  "/questions/upvote/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id
    });
    question
      .upvote(req.user)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.post(
  "/questions/upvote/undo/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id
    });
    question
      .undoUpvote(req.user)
      .then(data => res.send(data) || [])
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.post(
  "/questions/downvote/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id
    });
    question
      .downvote(req.user)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.post(
  "/questions/downvote/undo/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id
    });
    question
      .undoDownvote(req.user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Comments
  --------
*/

// creates a comment on a question with :id
router.post(
  "/questions/comments/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  body("body").exists(),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      user: req.user._id,
      body: req.body.body
    });
    const question = new Question({
      _id: req.params.id
    });
    question
      .addComment(comment)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

// delete a comment :cid from the question :qid
router.delete(
  "/questions/:qid/comments/:cid",
  ejwt({ secret: keys.jwtsecret }),
  param("qid", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  param("cid", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.qid
    });
    const comment = new Comment({
      _id: req.params.cid
    });
    const user = new User({
      _id: req.user._id
    });
    question
      .deleteComment(comment, user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(err.statusCode || 500, err.message)));
  }
);

module.exports = router;
