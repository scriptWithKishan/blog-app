const express = require("express");

const blogRouter = express.Router();

const {
  getUserBlogs,
  postUserBlog,
  subscribedBloggersBlogList,
  getPopularBlogs,
  toggleLikeBlog,
  recordBlogView,
  getBlogById,
} = require("./blog.controller");
const authorization = require("../../middleware/authorization");

blogRouter.get("/", authorization, getUserBlogs);
blogRouter.post("/", authorization, postUserBlog);
blogRouter.get("/subscribed-bloggers-blog-list", authorization, subscribedBloggersBlogList);
blogRouter.get("/popular", authorization, getPopularBlogs);
blogRouter.get("/:id", authorization, getBlogById);
blogRouter.post("/:id/like", authorization, toggleLikeBlog);
blogRouter.post("/:id/view", authorization, recordBlogView);

module.exports = blogRouter;

