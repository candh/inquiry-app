const Answer = require("../../models/Answer");
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

// Answers a question of qid
router.post(
  "/answers/:qid",
  ejwt({ secret: keys.jwtsecret }), // auth required, obviously
  param("qid", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  body("body").exists(),
  processValidationErrors,
  (req, res, next) => {
    let answer = new Answer({
      body: req.body.body,
      user: req.user._id
    });
    let question = new Question({
      _id: req.params.qid
    });
    // TODO: fix this (attach _id to the Question idiot)
    question
      .answerQuestion(answer)
      .then(data =>
        res.send({ statusCode: 200, message: "Answered", _id: data._id })
      )
      .catch(err => next(new ErrorHandler(500, err.message)));
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
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    let answer = new Answer();
    answer
      .getAnswer(req.params.id)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Update
  --------
*/

router.put(
  "/answers/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  body("body").isString(),
  processValidationErrors,
  (req, res, next) => {
    const answer = new Answer({
      _id: req.params.id,
      user: req.user._id,
      body: req.body.body
    });

    const question = new Question();
    question
      .proposeUpdateOnAnswer(answer)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.post(
  "/answers/edit/approve/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const delta = new Delta({
      _id: req.params.id
    });
    const user = new User({
      _id: req.user._id,
      role: req.user.role,
      username: req.user.username
    });
    question
      .approveUpdateOnAnswer(delta, user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Delete
  --------
*/

router.delete(
  "/answers/:qid/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("qid", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question({
      _id: req.params.qid
    });
    const answer = new Answer({
      _id: req.params.id
    });
    question
      .deleteAnswer(answer)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
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
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id
    });
    question
      .upvoteAnswer(answer, req.user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.post(
  "/answers/upvote/undo/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id
    });
    question
      .undoUpvoteAnswer(answer, req.user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

// undo upvote an answer
// why?
// router.post('/answers/upvote/undo/:id',
//   ejwt({ secret: keys.jwtsecret }),
//   param('id', 'Invalid Object ID').escape().custom(value => validateObjectID(value)),
//   processValidationErrors,
//   (req, res, next) => {
//     const answer = new Answer({
//       _id: req.params.id
//     })
//     answer.undoUpvoteAnswer(req.user)
//       .then(data => res.send(data))
//       .catch(err => next(new ErrorHandler(500, err.message)))
//   }
// )

// downvote an answer
router.post(
  "/answers/downvote/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id
    });
    question
      .downvoteAnswer(answer, req.user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

// undo downvote an answer
router.post(
  "/answers/downvote/undo/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const question = new Question();
    const answer = new Answer({
      _id: req.params.id
    });
    question
      .undoDownvoteAnswer(answer, req.user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Comments
  --------
*/

router.post(
  "/answers/comments/:id",
  ejwt({ secret: keys.jwtsecret }),
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  body("body").exists(),
  processValidationErrors,
  (req, res, next) => {
    const answer = new Answer({
      _id: req.params.id
    });
    const comment = new Comment({
      user: req.user._id,
      body: req.body.body
    });
    const question = new Question();
    question
      .addCommentOnAnswer(answer, comment)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.delete(
  "/answers/:aid/comments/:cid",
  ejwt({ secret: keys.jwtsecret }),
  param("aid", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  param("cid", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const answer = new Answer({
      _id: req.params.aid
    });
    const comment = new Comment({
      _id: req.params.cid
    });
    const user = new User({
      _id: req.user._id
    });
    const question = new Question();
    question
      .deleteCommentFromAnswer(answer, user, comment)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

module.exports = router;
