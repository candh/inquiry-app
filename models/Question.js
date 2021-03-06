const mongoose = require("mongoose");
const Answer = require("./Answer");
const Comment = require("./Comment");
const User = require("./User");
const Vote = require("./Vote");
const History = require("./History").History;
const Delta = require("./History").Delta;
const jsondiffpatch = require("jsondiffpatch");
const { APIError } = require("../helpers/error");

const questionschema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    votes: {
      type: Number,
      default: 0,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    // answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer', text: true }],
    answers: [Answer.schema],
    tags: [String],
    category: String,
    views: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// INDEX (COMPOUND)
questionschema.index({ title: "text", body: "text" });

function buildQuery(params) {
  let query = this.model("Question").find();
  if (params.sort) {
    query = query.sort({
      [params.sort]: params.order || "desc",
    });
  }
  if (params.limit) {
    query = query.limit(params.limit);
  }
  if (params.skip) {
    query = query.skip(params.skip);
  }
  if (params.fromdate) {
    query = query.gte("createdAt", params.fromdate);
  }
  if (params.todate) {
    query = query.lte("createdAt", params.todate);
  }
  if (params.category) {
    query = query.where("category").equals(params.category);
  }
  if (params.tags) {
    query = query.where("tags").in(params.tags);
  }

  // TODO: a better way?
  if (!params.includeAnswers) {
    // FUCK
    query = query.select({
      "answers.body": 0,
      "answers.comments": 0,
      "answers.accepted": 0,
      "answers.createdAt": 0,
      "answers.updatedAt": 0,
      "answers.user": 0,
      "answers.votes": 0,
      "answers.question": 0,
      "answers.__v": 0,
    });
  }

  if (params.searchText) {
    query = query.find({ $text: { $search: params.searchText } });
  }

  return query;
}
/*
  ------------------------
         Questions
  ------------------------
*/

/*
  --------
  Create
  --------
*/
questionschema.method("createQuestion", function () {
  return this.model("Question").create(this.toObject());
});

/*
  --------
  Read
  --------
*/

questionschema.method("getQuestions", function (params) {
  const query = buildQuery.call(this, params);
  return query.populate("user", "username").exec();
});

questionschema.method("getQuestion", async function () {
  // TOOD: maybe something better than this view count increment?
  await this.model("Question").updateOne(
    { _id: this._id },
    { $inc: { views: 1 } }
  );

  return (
    this.model("Question")
      .findById(this._id)
      .populate("user", "username meta")
      .populate("comments")
      .populate("answers.user", "username meta")
      .populate("answers.comments")
      .populate("comments.user", "username meta")
      // .populate('answers.comments.user', 'username meta')
      .sort("createdAt")
      .exec()
  );
});

questionschema.method("getAllQuestionsByUser", function (user) {
  return this.model("Question")
    .find({ user: user._id })
    .populate("user", "username meta")
    .populate("comments")
    .populate("answers.user", "username meta")
    .populate("answers.comments")
    .populate("comments.user", "username meta")
    .sort("createdAt");
});

questionschema.method("getAllQuestionsAnsweredByUser", function (user) {
  return this.model("Question")
    .find({ "answers.user": user._id })
    .populate("user", "username meta")
    .populate("comments")
    .populate("answers.user", "username meta")
    .populate("answers.comments")
    .populate("comments.user", "username meta")
    .sort("createdAt");
});

/*
  --------
  Update
  --------
*/

questionschema.method("proposeUpdate", async function (user) {
  // find the original question
  const orig = await this.model("Question").findById(this._id);

  // didn't wanted to do Object.assign
  // i think that would copy over more than we need

  const proposed = {
    body: this.body,
    title: this.title,
    category: this.category,
    tags: this.tags,
  };

  // xorig meaning, extracted properties from original
  const xorig = {
    body: orig.body,
    title: orig.title,
    category: orig.category,
    tags: orig.tags,
  };

  const computedDelta = jsondiffpatch.diff(xorig, proposed);
  if (!computedDelta || computedDelta == undefined) {
    // no need to do anything
    throw new APIError(400, "No changes");
  }

  // model delta
  const mdelta = new Delta({ delta: computedDelta, proposer: user._id });

  if (
    orig.user.equals(user._id) ||
    user.role == "Mod" ||
    user.role == "Admin"
  ) {
    // if OP is editing or it is a mod, then we also need to apply the edit
    // immediately, or in other words, approve
    mdelta.approver = user._id;
    mdelta.approvedAt = new Date();

    orig.body = proposed.body;
    orig.title = proposed.title;
    orig.category = proposed.category;
    orig.tags = proposed.tags;

    // save
    await orig.save();
  }

  // get the history associated with this post
  let history = await History.findOne({ post: this._id });

  // if there is a history, add a delta to the deltas
  if (history) {
    const check = await History.findOne({
      post: this._id,
      "deltas.proposer": user._id,
      "deltas.approvedAt": { $exists: false },
    });

    if (check == null) {
      history.deltas.push(mdelta);
    } else {
      throw new APIError(400, "Await for previous one to be approved");
    }
  } else {
    history = new History({
      deltas: [mdelta],
      post: this._id,
      original: xorig,
      onModel: "Question",
    });
  }

  await history.save();

  // returns the history id of the current question
  // and the id of the delta that was just inserted
  return { history: history._id, delta: mdelta._id, msg: "Ok." };
});

questionschema.method("approveUpdate", async function (delta, user) {
  // deltas.$ gets the only delta that matched the id
  // we could populate the History model but lets keep it simple
  const history = await History.findOne(
    { "deltas._id": delta._id },
    { "deltas.$": 1, post: 1 }
  );

  if (history && history != null) {
    const question = await this.model("Question").findOne({
      _id: history.post,
    });

    const op = await User.findById(question.user).select("-pswd");

    if (user.role == "Admin" || user.role == "Mod" || user._id == op._id) {
      const mdelta = history.deltas[0]; // can't believe im doing this in 2019
      const delta = mdelta.delta;

      if (mdelta.approvedAt) {
        // it means it has already been approved
        throw new APIError(400, "Already approved");
      }

      // if authorized, now we can apply the delta
      const patched = {
        body: question.body,
        title: question.title,
        category: question.category,
        tags: question.tags,
      };

      jsondiffpatch.patch(patched, delta);
      question.body = patched.body;
      question.title = patched.title;
      question.category = patched.category;
      question.tags = patched.tags;

      // approve/save the question
      await question.save();

      // also update the delta now
      await History.updateOne(
        { "deltas._id": mdelta._id },
        {
          $set: {
            "deltas.$.approver": user._id,
            "deltas.$.approvedAt": new Date(),
          },
        }
      );

      return question;
    } else {
      throw new APIError(400, "You cannot approve this edit");
    }
  } else {
    throw new APIError(400, "No edits to approve");
  }
});

/*
  --------
  Delete
  --------
*/

questionschema.method("delete", function () {
  return this.model("Question").deleteOne({ _id: this._id });
});

/*
  --------
  Upvotes/Downvotes
  --------
*/

questionschema.method("upvote", async function (user) {
  const query = this.model("Question").updateOne(
    { _id: this._id },
    { $inc: { votes: 1 } }
  );
  user = await User.findById(user._id).select("meta.votes");
  if (user.meta.votes) {
    // check first if the user has already downvoted it, if yes, then take that away
    const firstCheck = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { questionDownvotes: this._id } }
    );

    if (firstCheck.nModified === 1) {
      // if it was downvoted, undo that.
      await query.exec();
    }

    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $addToSet: { questionUpvotes: this._id } }
    );

    if (res.nModified === 1) {
      // update (increment) the votes on this question
      await query.exec();
    }

    return res;
  } else {
    const vote = new Vote({
      questionUpvotes: [this._id],
    });
    await vote.save();
    user.meta.votes = vote._id;
    await user.save();
    return await query.exec();
  }
});

questionschema.method("undoUpvote", async function (user) {
  user = await User.findById(user._id).select("meta.votes");

  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { questionUpvotes: this._id } }
    );

    if (res.nModified === 1) {
      // update (decrement) the votes on this question
      await this.model("Question").updateOne(
        { _id: this._id },
        { $inc: { votes: -1 } }
      );
    }
  }
});

questionschema.method("downvote", async function (user) {
  const query = this.model("Question").updateOne(
    { _id: this._id },
    { $inc: { votes: -1 } }
  );
  user = await User.findById(user._id).select("meta.votes");
  if (user.meta.votes) {
    // check first if the user has already upvoted it, if yes, then take that away
    const firstCheck = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { questionUpvotes: this._id } }
    );
    if (firstCheck.nModified === 1) {
      // update (decrement) the votes on this question
      await query.exec();
    }

    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $addToSet: { questionDownvotes: this._id } }
    );

    if (res.nModified === 1) {
      // update (decrement) the votes on this question
      await query.exec();
    }
    return res;
  } else {
    const vote = new Vote({
      questionDownvotes: [this._id],
    });
    await vote.save();
    user.meta.votes = vote._id;
    await user.save();
    return await query.exec();
  }
});

questionschema.method("undoDownvote", async function (user) {
  user = await User.findById(user._id).select("meta.votes");
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { questionDownvotes: this._id } }
    );
    if (res.nModified === 1) {
      // update (decrement) the votes on this question
      await this.model("Question").updateOne(
        { _id: this._id },
        { $inc: { votes: 1 } }
      );
    }
  }
});

/*
  --------
  Comments
  --------
*/
questionschema.method("addComment", async function (comment) {
  await comment.save();
  await this.model("Question").updateOne(
    { _id: this._id },
    { $addToSet: { comments: comment._id } }
  );
  return comment;
});

/*
  ------------------------
         Answers
  ------------------------
*/

/*
  --------
  Create
  --------
*/

questionschema.method("answerQuestion", async function (answer) {
  const question = await Question.findById(this._id);
  question.answers.push(answer);
  await question.save();
  return answer;
});

/*
  --------
  Delete
  --------
*/

questionschema.method("deleteAnswer", function (answer) {
  return this.model("Question").updateOne(
    { _id: this._id },
    { $pull: { answers: { _id: answer._id } } }
  );
});

/*
  --------
  Upvotes/Downvotes
  --------
*/

questionschema.method("upvoteAnswer", async function (answer, user) {
  const query = this.model("Question").updateOne(
    { "answers._id": answer._id },
    { $inc: { "answers.$.votes": 1 } }
  );

  user = await User.findById(user._id).select("meta.votes");

  if (user.meta.votes) {
    const removeFromDownvotes = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { answerDownvotes: answer._id } }
    );

    if (removeFromDownvotes.nModified === 1) {
      await query.exec();
    }

    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $addToSet: { answerUpvotes: answer._id } }
    );

    if (res.nModified === 1) {
      // update (increment) the votes on this answer
      await query.exec();
    }

    return res;
  } else {
    const vote = new Vote({
      answerUpvotes: [answer._id],
    });

    await vote.save();
    user.meta.votes = vote._id; // holy shit
    await user.save();
    return await query.exec();
  }
});

questionschema.method("undoUpvoteAnswer", async function (answer, user) {
  user = await User.findById(user._id).select("meta.votes");
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { answerUpvotes: answer._id } }
    );

    if (res.nModified === 1) {
      // update (decrement) the votes on this answer
      await this.model("Question").updateOne(
        { "answers._id": answer._id },
        { $inc: { "answers.$.votes": -1 } }
      );
    }
  }
});

questionschema.method("downvoteAnswer", async function (answer, user) {
  const query = this.model("Question").updateOne(
    { "answers._id": answer._id },
    { $inc: { "answers.$.votes": -1 } }
  );

  user = await User.findById(user._id).select("meta.votes");

  if (user.meta.votes) {
    // check first if the user has already upvoted it, if yes, then take that away
    const removeFromUpvotes = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { answerUpvotes: answer._id } }
    );
    if (removeFromUpvotes.nModified === 1) {
      // update (decrement) the votes on this question
      await query.exec();
    }
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $addToSet: { answerDownvotes: answer._id } }
    );
    if (res.nModified === 1) {
      // update (decrement) the votes on this answer
      await query.exec();
    }
    return res;
  } else {
    const vote = new Vote({
      answerDownvotes: [answer._id],
    });
    await vote.save();
    user.meta.votes = vote._id;
    await user.save();
    return await query.exec();
  }
});

questionschema.method("undoDownvoteAnswer", async function (answer, user) {
  user = await User.findById(user._id).select("meta.votes");
  if (user.meta.votes) {
    const res = await Vote.updateOne(
      { _id: user.meta.votes },
      { $pull: { answerDownvotes: answer._id } }
    );
    if (res.nModified === 1) {
      // update (increment) the votes on this answer
      await this.model("Question").updateOne(
        { "answers._id": answer._id },
        { $inc: { "answers.$.votes": 1 } }
      );
    }
  }
});

/*
  --------
  Answer Comments
  --------
*/

questionschema.method("addCommentOnAnswer", async function (answer, comment) {
  await comment.save();
  const res = await this.model("Question").updateOne(
    { "answers._id": answer._id },
    { $addToSet: { "answers.$.comments": comment._id } }
  );
  return comment;
});

questionschema.method(
  "deleteCommentFromAnswer",
  async function (answer, user, comment) {
    comment = await Comment.findById({ _id: comment._id }).catch((err) => {
      throw err;
    });
    if (comment) {
      if (!comment.user.equals(user._id)) {
        const err = new Error("You can't delete someone else's comment");
        err.statusCode = 401;
        throw err;
      }
      const deleted = await Comment.deleteOne({ _id: comment._id });
      await this.model("Question")
        .updateOne(
          { "answers._id": answer._id },
          { $pull: { "answers.$.comments": comment._id } }
        )
        .catch((err) => {
          throw err;
        });
      return deleted;
    } else {
      const err = new Error("No comment with this _id exists");
      err.statusCode = 404;
      throw err;
    }
  }
);

questionschema.method("proposeUpdateOnAnswer", async function (answer) {
  const res = {};
  const orig = await this.model("Question").findOne(
    { "answers._id": answer._id },
    { "answers.$": 1 }
  );

  if (!orig || orig == null) {
    throw new APIError(404, "Answer not found");
  }

  const currentAnswer = orig.answers[0]; // God help us

  const proposed = { body: answer.body };
  const xorig = { body: currentAnswer.body };

  // lets compute the delta
  const computedDelta = jsondiffpatch.diff(xorig, proposed); // don't change the order original first then proposed

  if (!computedDelta || computedDelta == undefined) {
    throw new APIError(400, "No changes");
  }

  const OP = await User.findById(currentAnswer.user);

  // lets store this delta
  const mdelta = new Delta({
    delta: computedDelta,
    proposer: answer.user._id,
  });

  if (answer.user.equals(OP._id) || OP.role == "Mod" || OP.role == "Admin") {
    // if OP is editing or it is a mod, then we also need to apply the edit
    // immediately, or in other words, approve
    mdelta.approver = OP._id;
    mdelta.approvedAt = new Date();
    await this.model("Question").updateOne(
      { "answers._id": answer._id },
      {
        $set: {
          "answers.$.body": proposed.body,
        },
      }
    );
  }

  // now save the history
  let history = await History.findOne({ post: answer._id });

  if (history) {
    // get all the deltas by this user
    const check = await History.findOne({
      post: answer._id,
      "deltas.proposer": answer.user,
      "deltas.approvedAt": { $exists: false },
    });

    if (check == null) {
      history.deltas.push(mdelta);
    } else {
      throw new APIError(400, "Await for previous one to be approved");
    }
    // check if delta already exists
    // const check = await History.findOne({ post: answer._id, 'deltas.delta': mdelta.delta }, { 'deltas.$.delta': 1 }).catch(err => { throw err })
    // if (!check) {
    //   history.deltas.push(mdelta)
    // } else if (check) {
    //   const checkDelta = check.deltas[0]
    //   if (checkDelta.proposer.equals(answer.user) && checkDelta.approvedAt == undefined) {
    //     const err = new Error("Await for previous one to be approved")
    //     err.statusCode = 400
    //     throw err
    //   } else {
    //     history.deltas.push(mdelta)
    //   }
    // }
  } else {
    history = new History({
      deltas: [mdelta],
      post: answer._id,
      original: xorig,
      onModel: "Answer",
    });
  }

  await history.save();
  return { history: history._id, delta: mdelta._id, msg: "Ok." };
});

questionschema.method("approveUpdateOnAnswer", async function (delta, user) {
  const history = await History.findOne(
    { "deltas._id": delta._id },
    { "deltas.$": 1, post: 1 }
  );

  if (history && history != null) {
    const post = await this.model("Question").findOne(
      { "answers._id": history.post },
      { "answers.$": 1 }
    );

    const OP = await User.findOne({ _id: post.answers[0].user });

    if (user.role == "Admin" || user.role == "Mod" || OP._id.equals(user._id)) {
      const mdelta = history.deltas[0];
      if (mdelta.approvedAt) {
        // it means it has already been approved
        throw new APIError(400, "Already approved");
      }

      const patched = {
        body: post.answers[0].body,
      };
      jsondiffpatch.patch(patched, mdelta.delta);

      // save the answer
      await this.model("Question").updateOne(
        { "answers._id": post.answers[0]._id },
        {
          $set: {
            "answers.$.body": patched.body,
          },
        }
      );

      // update the history
      await History.updateOne(
        { "deltas._id": mdelta._id },
        {
          $set: {
            "deltas.$.approver": user._id,
            "deltas.$.approvedAt": new Date(),
          },
        }
      );

      return post;
    } else {
      throw new APIError(404, "You cannot approve this edit");
    }
  } else {
    throw new APIError(404, "No delta with this id exists");
  }
});

// create model
const Question = mongoose.model("Question", questionschema);
Question.on("index", (err) => {
  if (err) {
    console.error(err);
  }
});

module.exports = Question;
