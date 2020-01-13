const Comment = require("../../models/Comment");

const ejwt = require("express-jwt");
const express = require("express");
const router = express.Router();
const process = require("process");
const keys = {
  jwtsecret: process.env.jwtsecret
};

const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const {
  ErrorHandler,
  processValidationErrors
} = require("../../helpers/error");
const { param } = require("express-validator");

router.post(
  "/comments/upvote/:id",
  ejwt({ secret: keys.jwtsecret }), // auth required, obviously
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.params.id,
      user: req.user._id
    });
    comment
      .upvote()
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.post(
  "/comments/undo/upvote/:id",
  ejwt({ secret: keys.jwtsecret }), // auth required, obviously
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.params.id,
      user: req.user._id
    });
    comment
      .undoUpvote()
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

router.delete(
  "/comments/:id",
  ejwt({ secret: keys.jwtsecret }), // auth required, obviously
  param("id", "Invalid Object ID")
    .escape()
    .custom(value => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.params.id,
      user: req.user._id
    });

    comment
      .delete()
      .then(data => res.send(data || []))
      .catch(err => next(new ErrorHandler(500, err.message)));
  }
);

module.exports = router;
