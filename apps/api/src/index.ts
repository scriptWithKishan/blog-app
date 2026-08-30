import type { Request, Response } from "express";
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// dotenv config
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRouter = require("./modules/auth/auth.route");

app.use("/auth", authRouter);

const PORT = process.env.PORT || 5000;
const dbConnect = require("./config/db");
const runServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log("Server running at port: ", PORT);
    });

    await dbConnect();
  } catch (err: any) {
    console.log("Server Error: ", err.message);
  }
};

runServer();
