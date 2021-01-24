const Comment = require("../../models/Comment");
const Delta = require("../../models/History").Delta;
const Question = require("../../models/Question");
const User = require("../../models/User");

const jwt = require("express-jwt");
const express = require("express");

const process = require("process");
const keys = {
  jwtsecret: process.env.jwtsecret,
};

const ejwtauth = jwt({ secret: keys.jwtsecret, algorithms: ["HS256"] });

const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { processValidationErrors } = require("../../helpers/error");

const { query, param, body } = require("express-validator");

/*
  --------
  Create
  --------
*/

router.post(
  "/questions",
  ejwtauth,
  body("title").isString().isLength({ min: 10 }),
  body("body").isString().isLength({ min: 15 }),
  body("tags").isArray(),
  body("category").isString().isLength({ min: 5 }),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      title: req.body.title,
      body: req.body.body,
      tags: req.body.tags,
      category: req.body.category,
      user: req.user._id,
    });
    question
      .createQuestion()
      .then((data) => res.send(data))
      .catch(next);
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
  query("limit").toInt(),
  query("skip").toInt(),
  query("category").escape(),
  query("tags").optional({ checkFalsy: true }).isArray(),

  query("sort")
    .optional({ checkFalsy: true })
    .isString()
    .isIn(["votes", "views", "createdAt"]),

  query("order")
    .optional({ checkFalsy: true })
    .isString()
    .isIn(["asc", "desc"]),

  query("fromdate").optional({ checkFalsy: true }).isISO8601(),
  query("todate").optional({ checkFalsy: true }).isISO8601(),

  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    question
      .getQuestions(req.query)
      .then((data) => res.send(data || []))
      .catch(next);
  }
);

// get one questions
router.get(
  "/questions/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({ _id: req.params.id });
    question
      .getQuestion()
      // TODO: maybe don't send the entire data back
      .then((data) => res.send(data || []))
      .catch(next);
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
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  body("title").isString().isLength({ min: 10 }),
  body("body").isString().isLength({ min: 15 }),
  body("tags").isArray(),
  body("category").exists().isLength({ min: 5 }),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
      body: req.body.body,
      title: req.body.title,
      tags: req.body.tags,
      category: req.body.category,
    });

    question
      .proposeUpdate(req.user)
      .then((data) => res.send(data))
      .catch(next);
  }
);

// approve an update to the questions
router.post(
  "/questions/edit/approve/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const delta = new Delta({
      _id: req.params.id,
    });
    const question = new Question();
    question
      .approveUpdate(delta, req.user)
      .then((data) => res.send(data || []))
      .catch(next);
  }
);

/*
  --------
  Delete
  --------
*/

router.delete(
  "/questions/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
    });
    question
      .delete()
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

/*
  --------
  Upvotes/Downvotes
  --------
*/

router.post(
  "/questions/upvote/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
    });
    question
      .upvote(req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

router.post(
  "/questions/upvote/undo/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
    });
    question
      .undoUpvote(req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

router.post(
  "/questions/downvote/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
    });
    question
      .downvote(req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

router.post(
  "/questions/downvote/undo/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.id,
    });
    question
      .undoDownvote(req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

/*
  --------
  Comments
  --------
*/

/* creates a comment on a question with :id */

router.post(
  "/questions/comments/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  body("body").isString().isLength({ min: 10 }),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      user: req.user._id,
      body: req.body.body,
    });
    const question = new Question({
      _id: req.params.id,
    });
    question
      .addComment(comment)
      .then((data) => res.send(data))
      .catch(next);
  }
);

// DEPRECATED. DO NOT USE THIS
// THIS IS NO GOOD
// ** use DELETE /comments/:id **

router.delete("/questions/:qid/comments/:cid", (req, res) => {
  res.sendStatus(501);
});

module.exports = router;
