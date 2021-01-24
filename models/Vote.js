const mongoose = require("mongoose");

const voteschema = new mongoose.Schema({
  questionUpvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  questionDownvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  ],
  answerUpvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
  answerDownvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
  commentUpvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Vote", voteschema);
