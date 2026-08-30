const express = require("express");

const authRouter = express.Router();

const {signUpController, signInController} = require("./auth.controller");

authRouter.post("/sign-up", signUpController);
authRouter.post("/sign-in", signInController);

module.exports = authRouter