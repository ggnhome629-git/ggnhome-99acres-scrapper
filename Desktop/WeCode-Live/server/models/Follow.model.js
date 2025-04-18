const mongoose = require("mongoose");

const FollowSchema = mongoose.Schema(
  {
    following_id: {  // User who is following   // My ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // Reference to the User model
      required: true,
    },
    followed_id: {  // User being followed  // Users i am FOllowing
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // Reference to the User model
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
FollowSchema.pre("save", async function (next) {
    const exists = await mongoose.model("Follow").findOne({
      following_id: this.following_id,
      followed_id: this.followed_id,
    });
  
    if (exists) {
      const err = new Error("Already following this user.");
      return next(err);
    }
  
    next();
  });

module.exports = mongoose.model("Follow", FollowSchema);