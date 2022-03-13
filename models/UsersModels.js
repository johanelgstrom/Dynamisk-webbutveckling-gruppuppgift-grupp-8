const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String },
  hashedPassword: { type: String },
  googleId: { type: String },
  displayName: { type: String },
});

const UsersModel = mongoose.model("Users", userSchema);

module.exports = UsersModel;
