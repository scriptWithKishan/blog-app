const express = require("express");

const userRouter = express.Router();

const {
  getUserData,
  updateUserData,
  toggleSubscribeBlogger,
  searchUsers,
} = require("./user.controller");
const authorization = require("../../middleware/authorization");

userRouter.get("/", authorization, getUserData);
userRouter.get("/search", authorization, searchUsers);
userRouter.patch("/", authorization, updateUserData);
userRouter.post("/subscribe/:bloggerId", authorization, toggleSubscribeBlogger);
userRouter.post("/subscribe", authorization, toggleSubscribeBlogger);

module.exports = userRouter;



