const Comment = require("../../models/Comment");

const jwt = require("express-jwt");
const express = require("express");
const router = express.Router();
const process = require("process");
const keys = {
  jwtsecret: process.env.jwtsecret,
};

const ejwtauth = jwt({ secret: keys.jwtsecret, algorithms: ["HS256"] });

const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { processValidationErrors } = require("../../helpers/error");
const { param } = require("express-validator");

router.get(
  "/comments/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({ _id: req.params.id });
    comment
      .getComment()
      .then((data) => res.send(data || []))
      .catch(next);
  }
);

router.post(
  "/comments/upvote/:id",
  ejwtauth, // auth required, obviously
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.params.id,
      user: req.user._id,
    });
    comment
      .upvote()
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

router.post(
  "/comments/undo/upvote/:id",
  ejwtauth, // auth required, obviously
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.params.id,
      user: req.user._id,
    });
    comment
      .undoUpvote()
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

router.delete(
  "/comments/:id",
  ejwtauth, // auth required, obviously
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.params.id,
      user: req.user._id,
    });

    comment
      .delete()
      .then((data) => res.sendStatus(204))
      .catch(next);
  }
);

module.exports = router;
