const express = require("express");

const userRouter = express.Router();

const { getUserData, updateUserData } = require("./user.controller");
const authorization = require("../../middleware/authorization");

userRouter.get("/", authorization, getUserData);
userRouter.patch("/", authorization, updateUserData);

module.exports = userRouter;

