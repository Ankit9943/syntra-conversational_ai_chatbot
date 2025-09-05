const mongoose = require("mongoose");

async function connectDB() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MONGODB Connected!!");
    })
    .catch((err) => {
      console.log("MONGODB connection error", err);
    });
}

module.exports = connectDB;
