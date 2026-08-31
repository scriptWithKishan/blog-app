type Request = import("express").Request;
type Response = import("express").Response;
const User = require("../../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signUpController = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists!",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: encryptedPassword,
    });

    return res.status(200).json({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (err: any) {
    console.error("Server error: ", err.message);
    return res.status(500).json({
      message: "Internal server err",
    });
  }
};

const signInController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required!",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ user: user._id }, JWT_SECRET, { expiresIn: "24h" })

    return res.status(200).json({
      message: "You have logged in successfully!",
      token,
    });
  } catch (err: any) {
    console.error("Server error: ", err.message);
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

module.exports = { signUpController, signInController };
