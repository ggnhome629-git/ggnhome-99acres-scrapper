const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config(); // ✅ Load env vars properly



const userSchema = mongoose.Schema(
  {
    profileimage: {
      type: String,
      default: "",
      
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
    },
    refreshToken: {
      type: String
    },

    // ✅ New fields added below
    phone: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    goals: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],

    questions: {
      type: [
        {
          questionId: {
            type: String,
            required: true,
          },
          revision: {
            type: Boolean,
            default: false,
          },
          important: {
            type: Boolean,
            default: false,
          },
        }
      ],
      default: [],
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the User model
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the User model
      },
    ],
    posts: [
      {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post"
        },
        caption: {
          type: String,
          default: ""
        }
      }
    ],
    isGoogleUser: {
      type: Boolean,
      default: false,
    }
    
  },
  {
    timestamps: true
  }
);


// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔐 Check password correctness
userSchema.methods.isPasswordCorrect = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

// 🔑 Generate Access Token
userSchema.methods.getAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE }
  );
};

// 🔑 Generate Refresh Token
userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRE }
  );
};





module.exports = mongoose.model("User", userSchema);