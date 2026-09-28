const mongoose = require("mongoose");

const blogViewSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can have only one view record for a particular blog
blogViewSchema.index(
  { blog: 1, user: 1 },
  { unique: true }
);

const BlogView = mongoose.model("BlogView", blogViewSchema);

module.exports = BlogView;