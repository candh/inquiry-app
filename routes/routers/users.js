const User = require("../../models/User");
const Question = require("../../models/Question");

const exjwt = require("express-jwt");
const express = require("express");
const jwt = require("jsonwebtoken");
const process = require("process");

const keys = {
  jwtsecret: process.env.jwtsecret,
};

const ejwtauth = exjwt({ secret: keys.jwtsecret, algorithms: ["HS256"] });

const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { processValidationErrors, APIError } = require("../../helpers/error");
const { param, body } = require("express-validator");

/*
  --------
  Create
  --------
*/

router.post(
  "/users/register",
  body("firstname").escape(),
  body("lastname").escape(),
  body(
    "username",
    "Username is required and only alpha numeric characters are allowed"
  ).isAlphanumeric(),
  body("email", "Email is required").isEmail().normalizeEmail(),
  body(
    "pswd",
    "Password is required, must contain atleast 6 characters, and must be a string."
  )
    .isLength({ min: 6 })
    .isString(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .createUser(req.body)
      .then((data) => {
        res.send({ statusCode: 200, message: "User registered" });
      })
      .catch(next);
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
    .normalizeEmail(),
  body(
    "pswd",
    "Password is required, must contain atleast 6 characters, and must be a string."
  )
    .isLength({ min: 6 })
    .isString(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .checkIfUserWithEmailExists(req.body.email)
      .then((_user) => {
        // verify password
        if (user.checkPass(_user, req.body.pswd)) {
          let token = jwt.sign(
            {
              _id: _user._id,
              username: _user.username,
              role: _user.meta.role,
            },
            keys.jwtsecret
          );
          // TODO: never expiring tokens
          res.send({
            statusCode: 200,
            _id: _user._id,
            token,
            message: "Keep it safe :)",
          });
        } else {
          next(new APIError(400, "Invalid Password"));
        }
      })
      .catch(next);
  }
);

router.get(
  "/users/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .getUser(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.get(
  "/users/checkusername/:username",
  param("username").escape().isString(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .checkIfUserWithUsernameExists(req.params.username)
      .then((data) => res.send(data || []))
      .catch(next);
  }
);

/*
  --------
  Delete
  --------
*/

router.delete("/users/", ejwtauth, (req, res, next) => {
  let user = new User();
  user
    .deleteUser(req.user._id)
    // https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#delete-methods
    .then((data) => res.sendStatus(204)) // yep, thats it.
    .catch(next);
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
    .custom((value) => validateObjectID(value)),
  (req, res, next) => {
    const user = new User({
      _id: req.params.id,
    });
    const question = new Question();
    question
      .getAllQuestionsByUser(user)
      .then((data) => res.send(data))
      .catch(next);
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
    .custom((value) => validateObjectID(value)),
  (req, res, next) => {
    const user = new User({
      _id: req.params.id,
    });
    const question = new Question();
    question
      .getAllQuestionsAnsweredByUser(user)
      .then((data) => res.send(data))
      .catch(next);
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
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id,
    });
    user
      .checkQuestionUpvote(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.get(
  "/users/questions/downvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id,
    });
    user
      .checkQuestionDownvote(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.get(
  "/users/answers/upvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id,
    });
    user
      .checkAnswerUpvote(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.get(
  "/users/answers/downvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    let user = new User({
      _id: req.user._id,
    });
    user
      .checkAnswerDownvote(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.get(
  "/users/comments/upvote/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    const user = new User({
      _id: req.user._id,
    });
    user
      .checkCommentUpvote(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  }
);

/*
router.get('/users/test', ejwtauth({ secret: keys.jwtsecret }), (err, req, res, next) => {
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
