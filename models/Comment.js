const mongoose = require("mongoose");
const User = require("./User");
const Question = require("./Question");
const Answer = require("./Answer");
const Vote = require("./Vote");
const { APIError } = require("../helpers/error");

const commentschema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    body: String,
    meta: {
      votes: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

commentschema.method("getComment", async function () {
  return this.model("Comment").findById(this._id);
});

commentschema.method("upvote", async function () {
  const query = this.model("Comment").updateOne(
    { _id: this._id },
    { $inc: { "meta.votes": 1 } }
  );
  const user = await User.findById(this.user).select("meta.votes");
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $addToSet: { commentUpvotes: this._id } }
    );
    if (res.nModified === 1) {
      await query.exec();
    }
  } else {
    const vote = new Vote({
      commentUpvotes: [this._id],
    });
    await vote.save();
    user.meta.votes = vote._id;
    await user.save();
    await query.exec();
  }
});

commentschema.method("undoUpvote", async function () {
  const user = await User.findById(this.user).select("meta.votes");
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { commentUpvotes: this._id } }
    );

    if (res.nModified === 1) {
      await this.model("Comment").updateOne(
        { _id: this._id },
        { $inc: { "meta.votes": -1 } }
      );
    }
  }
});

commentschema.method("delete", async function () {
  const comment = await this.model("Comment").findById(this._id);
  if (comment.user.equals(this.user)) {
    // delete this comment
    const res = await this.model("Comment").deleteOne({ _id: this._id });

    // perform cleanup
    // * remove comment from question (one to one relation)

    await Question.updateOne(
      { comments: this._id },
      { $pull: { comments: this._id } }
    );

    // * perform cleanup on the answer
    await Question.updateOne(
      { "answers.comments": this._id },
      { $pull: { "answers.$.comments": this._id } }
    );
  } else {
    throw new APIError(400, "You cannot delete this comment. FOH");
  }
});

module.exports = mongoose.model("Comment", commentschema);
