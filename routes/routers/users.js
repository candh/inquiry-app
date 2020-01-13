const User = require("../../models/User");
const Question = require("../../models/Question");

const ejwt = require("express-jwt");
const express = require("express");
const jwt = require("jsonwebtoken");
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
  "/users/register",
  sanitizeBody("firstname").escape(),
  sanitizeBody("lastname").escape(),
  body(
    "username",
    "Username is required and only alpha numeric characters are allowed"
  )
    .isAlphanumeric()
    .exists({ checkFalsy: true }),
  body("email", "Email is required")
    .exists()
    .isEmail(),
  body("pswd", "Password is required").exists({ checkFalsy: true }),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .createUser(req.body)
      .then(data => res.send({ statusCode: 200, message: "User registered" }))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Read
  --------
*/

router.post(
  "/users/login",
  body("email", "Email is required and must be a valid mail")
    .isEmail()
    .exists(),
  body("pswd", "Password is required").exists(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .checkIfUserWithEmailExists(req.body.email)
      .then(_user => {
        // verify password
        if (user.checkPass(_user, req.body.pswd)) {
          let token = jwt.sign(
            {
              _id: _user._id,
              username: _user.username,
              role: _user.meta.role
            },
            keys.jwtsecret
          );
          // TODO: never expiring tokens
          res.send({
            statusCode: 200,
            _id: _user._id,
            token,
            message: "Keep it safe :)"
          });
        } else {
          next(new ErrorHandler(400, "Invalid Password"));
        }
      })
      .catch(err => next(new ErrorHandler(404, err.message)));
  }
);

router.get(
  "/users/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value))
    .exists(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .getUser(req.params.id)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.get(
  "/users/checkusername/:username",
  param("username")
    .escape()
    .isString()
    .exists(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .checkIfUserWithUsernameExists(req.params.username)
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Delete
  --------
*/

router.delete("/users/", ejwt({ secret: keys.jwtsecret }), (req, res, next) => {
  let user = new User();
  user
    .deleteUser(req.user._id)
    .then(data => res.send(data))
    .catch(err => next(new ErrorHandler(500, err.message)));
});

/*
  --------
  Get Questions
  --------
*/

router.get(
  "/users/questions/all/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  (req, res, next) => {
    const user = new User({
      _id: req.params.id
    });
    const question = new Question();
    question
      .getAllQuestionsByUser(user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Get Answers
  --------
*/

router.get(
  "/users/answers/all/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  (req, res, next) => {
    const user = new User({
      _id: req.params.id
    });
    const question = new Question();
    question
      .getAllQuestionsAnsweredByUser(user)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
  --------
  Check Upvotes
  --------
*/

// check if the user upvoted this question
router.get(
  "/users/questions/upvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  ejwt({ secret: keys.jwtsecret }),
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id
    });
    user
      .checkQuestionUpvote(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.get(
  "/users/questions/downvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  ejwt({ secret: keys.jwtsecret }),
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id
    });
    user
      .checkQuestionDownvote(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.get(
  "/users/answers/upvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  ejwt({ secret: keys.jwtsecret }),
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id
    });
    user
      .checkAnswerUpvote(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.get(
  "/users/answers/downvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  ejwt({ secret: keys.jwtsecret }),
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id
    });
    user
      .checkAnswerDownvote(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.get(
  "/users/comments/upvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  ejwt({ secret: keys.jwtsecret }),
  processValidationErrors,
  (req, res, next) => {
    const user = new User({
      _id: req.user._id
    });
    user
      .checkCommentUpvote(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

/*
router.get('/users/test', ejwt({ secret: keys.jwtsecret }), (err, req, res, next) => {
  if (err) {
    console.log(err.message)
    throw new ErrorHandler(500, err.message)
  }
  if (!req.user.username) {
    res.send({ statusCode: 401, message: 'Unauthorized' })
  } else {
    res.send({ statusCode: 200, message: 'Come on In!' })
  }
})
 */

module.exports = router;
