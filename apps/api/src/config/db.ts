const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB server connected successfully!");
  } catch (err: any) {
    console.error("MongoDB error: ", err.message);
  }
}

module.exports = dbConnect;