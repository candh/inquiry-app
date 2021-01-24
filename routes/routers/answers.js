const Answer = require("../../models/Answer");
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
const { param, body } = require("express-validator");

/*
  --------
  Create

  TODO: 
    - don't let users answer a question more than once.
  --------
*/

// Answers a question of qid
router.post(
  "/answers/:qid",
  ejwtauth, // auth required, obviously
  param("qid", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  body("body").isString().isLength({ min: 10 }),
  processValidationErrors,
  (req, res, next) => {
    let answer = new Answer({
      body: req.body.body,
      user: req.user._id,
    });
    let question = new Question({
      _id: req.params.qid,
    });
    question
      .answerQuestion(answer)
      .then((data) =>
        res.send({ statusCode: 200, message: "Answered", _id: data._id })
      )
      .catch(next);
  }
);

/*
  --------
  Read
  --------
*/

// Gets one answer. Not sure why this will be usefull
router.get(
  "/answers/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    let answer = new Answer({ _id: req.params.id });
    answer
      .getAnswer()
      .then((data) => res.send(data || []))
      .catch(next);
  }
);

/*
  --------
  Update
  --------

  propse a update to the answer.
*/

router.put(
  "/answers/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  body("body").isString().isLength({ min: 15 }),
  processValidationErrors,
  (req, res, next) => {
    const answer = new Answer({
      _id: req.params.id,
      user: req.user._id,
      body: req.body.body,
    });

    const question = new Question();
    question
      .proposeUpdateOnAnswer(answer)
      .then((data) => res.send(data || []))
      .catch(next);
  }
);

router.post(
  "/answers/edit/approve/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const delta = new Delta({
      _id: req.params.id,
    });
    const user = new User({
      _id: req.user._id,
      role: req.user.role,
      username: req.user.username,
    });
    question
      .approveUpdateOnAnswer(delta, user)
      .then((data) => res.send(data))
      .catch(next);
  }
);

/*
  --------
  Delete
  --------
*/

router.delete(
  "/answers/:qid/:id",
  ejwtauth,
  param("qid", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.qid,
    });
    const answer = new Answer({
      _id: req.params.id,
    });
    question
      .deleteAnswer(answer)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

/*
  --------
  Upvotes/Downvotes
  --------
*/

// upvote an answer
router.post(
  "/answers/upvote/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id,
    });
    question
      .upvoteAnswer(answer, req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

router.post(
  "/answers/upvote/undo/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id,
    });
    question
      .undoUpvoteAnswer(answer, req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

// downvote an answer
router.post(
  "/answers/downvote/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id,
    });
    question
      .downvoteAnswer(answer, req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

// undo downvote an answer
router.post(
  "/answers/downvote/undo/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id,
    });
    question
      .undoDownvoteAnswer(answer, req.user)
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

/*
  --------
  Comments
  --------
*/

router.post(
  "/answers/comments/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  body("body").isString().isLength({ min: 10 }),
  processValidationErrors,
  (req, res, next) => {
    const answer = new Answer({
      _id: req.params.id,
    });
    const comment = new Comment({
      user: req.user._id,
      body: req.body.body,
    });
    const question = new Question();
    question
      .addCommentOnAnswer(answer, comment)
      .then((data) => res.send(data))
      .catch(next);
  }
);

// DEPRECATED. DO NOT USE THIS
// THIS IS NO GOOD
// ** use DELETE /comments/:id **

router.delete("/answers/:aid/comments/:cid", (req, res) => {
  res.sendStatus(501);
});

module.exports = router;
