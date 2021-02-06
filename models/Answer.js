const mongoose = require("mongoose");
const User = require("./User");
const Vote = require("./Vote");

const answerschema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    body: {
      type: String,
      // text: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

answerschema.method("getAnswer", function () {
  return this.model("Question")
    .findOne({ "answers._id": this._id })
    .populate("answers.user", "username meta")
    .populate("answers.comments")
    .exec();
});

/*
 answerschema.method('upvoteAnswer', async function (user) {
  user = await User.findById(user._id)
  if (user.meta.votes) {
    const res = await Vote.updateOne({ _id: user.meta.votes }, { $addToSet: { answerUpvotes: this._id } }).catch(err => { throw err })
    if (res.nModified === 1) {
      // update (increment) the votes on this question
      await this.model('Question').updateOne({ _id: this._id }, { $inc: { votes: 1 } }).catch(err => { throw err })
    }
    return res
  } else {
    const vote = new Vote({
      answerUpvotes: [this._id]
    })
    await vote.save()
      .catch(err => { throw err })
    user.meta.votes = vote._id
    await user.save()
      .catch(err => { throw err })
    return { ok: 1, nModified: 1 }
  }
})

answerschema.method('undoUpvoteAnswer', async function (user) {
  user = await User.findById(user._id)
  if (user.meta.votes) {
    const res = await Vote.updateOne({ _id: user.meta.votes }, { $pull: { answerUpvotes: this._id } }).catch(err => { throw err })
    if (res.nModified === 1) {
      // update (decrement) the votes on this answer
      await this.model('Answer').updateOne({ _id: this._id }, { $inc: { votes: -1 } }).catch(err => { throw err })
    }
    return res
  } else {
    return { ok: 0 }
  }
} )
*/
module.exports = mongoose.model("Answer", answerschema);
