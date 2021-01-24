const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { APIError } = require("../helpers/error");

const userschema = mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    username: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    profile_pic: String,
    email: {
      type: String,
      unique: true,
      required: true,
      validate: function (value) {
        return validator.isEmail(value);
      },
    },
    pswd: {
      type: String,
      required: true,
      set: function (value) {
        return bcrypt.hashSync(value, 10);
      },
    },
    meta: {
      reputation: Number,
      role: {
        type: String,
        default: "User",
        enum: ["Admin", "Mod", "User"],
      },
      votes: { type: mongoose.Schema.Types.ObjectId, ref: "Vote" },
    },
  },
  {
    timestamps: true,
  }
);

userschema.method("createUser", async function (user) {
  let User = this.model("User");
  // TODO: optimize
  if ((await User.findOne({ email: user.email })) !== null) {
    throw new APIError(400, "User with this email already exists");
  }
  if ((await User.findOne({ username: user.username })) !== null) {
    throw new APIError(400, "User with this username already exists");
  }

  return await User.create(user);
});

userschema.method("checkIfUserWithEmailExists", async function (email) {
  let User = this.model("User");
  let user = await User.findOne({ email });

  if (user == null) {
    throw new APIError(404, "No user with this email exists");
  }
  return user;
});

userschema.method("checkIfUserWithUsernameExists", async function (username) {
  let User = this.model("User");
  return await User.findOne({ username }).select("username");
});

userschema.method("getUser", async function (_id) {
  let User = this.model("User");
  let user = await User.findOne({ _id }).select("-pswd");
  if (!user) {
    throw new APIError(404, "No user found");
  }
  return user;
});

userschema.method("checkPass", function (user, pswd) {
  return bcrypt.compareSync(pswd, user.pswd);
});

userschema.method("deleteUser", async function (_id) {
  return await this.model("User").deleteOne({ _id });
});

userschema.method("checkQuestionUpvote", async function (id) {
  const user = await this.model("User")
    .findOne({ _id: this._id })
    .populate("meta.votes")
    .select("meta");

  if (user.meta.votes != undefined) {
    const questionUpvotes = user.meta.votes.questionUpvotes;
    return questionUpvotes.filter((v) => v == id);
  } else {
    return [];
  }
});

userschema.method("checkQuestionDownvote", async function (id) {
  const user = await this.model("User")
    .findOne({ _id: this._id })
    .populate("meta.votes")
    .select("meta");
  if (user.meta.votes != undefined) {
    const questionDownvotes = user.meta.votes.questionDownvotes;
    return questionDownvotes.filter((v) => v == id);
  } else {
    return [];
  }
});

userschema.method("checkAnswerUpvote", async function (id) {
  const user = await this.model("User")
    .findOne({ _id: this._id })
    .populate("meta.votes")
    .select("meta");
  if (user.meta.votes != undefined) {
    const answerUpvotes = user.meta.votes.answerUpvotes;
    return answerUpvotes.filter((v) => v == id);
  } else {
    return [];
  }
});

userschema.method("checkAnswerDownvote", async function (id) {
  const user = await this.model("User")
    .findOne({ _id: this._id })
    .populate("meta.votes")
    .select("meta");
  if (user.meta.votes != undefined) {
    const answerDownvotes = user.meta.votes.answerDownvotes;
    return answerDownvotes.filter((v) => v == id);
  } else {
    return [];
  }
});

userschema.method("checkCommentUpvote", async function (id) {
  const user = await this.model("User")
    .findOne({ _id: this._id })
    .populate("meta.votes")
    .select("meta");
  if (user.meta.votes != undefined) {
    const commentUpvotes = user.meta.votes.commentUpvotes;
    return commentUpvotes.filter((v) => v == id);
  } else {
    return [];
  }
});

module.exports = mongoose.model("User", userschema);
