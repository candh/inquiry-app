const mongoose = require("mongoose");

const deltaschema = new mongoose.Schema(
  {
    delta: { type: Object },
    proposer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    rejectedAt: Date
  },
  {
    timestamps: true
  }
);

const Delta = new mongoose.model("Delta", deltaschema);

// will maybe add more things if needed
const historyschema = new mongoose.Schema(
  {
    deltas: [Delta.schema],
    original: { type: mongoose.Schema.Types.Mixed }, // can't put both Answer and Question here
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "onModel"
    },
    onModel: {
      type: String,
      required: true,
      enum: ["Question", "Answer"]
    }
  },
  {
    timestamps: true
  }
);

const History = mongoose.model("History", historyschema);

module.exports = {
  Delta,
  History
};
