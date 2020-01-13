const mongoose = require("mongoose");
const User = require("./User");
const Question = require("./Question");
const Answer = require("./Answer");
const Vote = require("./Vote");

const commentschema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    body: String,
    meta: {
      votes: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

commentschema.method("upvote", async function() {
  const query = this.model("Comment").updateOne(
    { _id: this._id },
    { $inc: { "meta.votes": 1 } }
  );
  const user = await User.findById(this.user)
    .select("meta.votes")
    .catch(err => {
      throw err;
    });
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $addToSet: { commentUpvotes: this._id } }
    ).catch(err => {
      throw err;
    });
    if (res.nModified === 1) {
      await query.exec().catch(err => {
        throw err;
      });
    }
    return res;
  } else {
    const vote = new Vote({
      commentUpvotes: [this._id]
    });
    await vote.save().catch(err => {
      throw err;
    });
    user.meta.votes = vote._id;
    await user.save().catch(err => {
      throw err;
    });
    return query.exec();
  }
});

commentschema.method("undoUpvote", async function() {
  const user = await User.findById(this.user)
    .select("meta.votes")
    .catch(err => {
      throw err;
    });
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { commentUpvotes: this._id } }
    ).catch(err => {
      throw err;
    });
    if (res.nModified === 1) {
      await this.model("Comment")
        .updateOne({ _id: this._id }, { $inc: { "meta.votes": -1 } })
        .catch(err => {
          throw err;
        });
    }
    return res;
  } else {
    const err = new Error("Can't undo upvote");
    throw err;
  }
});

commentschema.method("delete", async function() {
  const comment = await this.model("Comment").findById(this._id);
  if (comment.user.equals(this.user)) {
    // delete this comment
    const res = await this.model("Comment")
      .deleteOne({ id: this._id })
      .catch(err => {
        throw err;
      });

    // perform cleanup
    // * remove comment from question (one to one relation)

    await Question.updateOne(
      { comments: this._id },
      { $pull: { comments: this._id } }
    ).catch(err => {
      throw err;
    });

    // * perform cleanup on the answer

    Question.updateOne(
      { "answers.comments": this._id },
      { $pull: { "answers.$.comments": this._id } }
    ).catch(err => {
      throw err;
    });

    return res;
  } else {
    const err = new Error("You cannot delete this comment. FOH");
    err.statusCode = 400;
    throw err;
  }
});

module.exports = mongoose.model("Comment", commentschema);
