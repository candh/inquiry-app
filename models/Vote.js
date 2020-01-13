const mongoose = require("mongoose");

const voteschema = new mongoose.Schema({
  questionUpvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Question", unique: true }
  ],
  questionDownvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Question", unique: true }
  ],
  answerUpvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Answer", unique: true }
  ],
  answerDownvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Answer", unique: true }
  ],
  commentUpvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", unique: true }
  ]
});

module.exports = mongoose.model("Vote", voteschema);
