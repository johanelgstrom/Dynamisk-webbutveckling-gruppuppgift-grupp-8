const mongoose = require("mongoose");

const googleShema = new mongoose.Schema({
  googleId: { type: String, require: true },
  displayName: { type: String, require: true },
});

const GoogleModel = mongoose.model("GoogleUsers", googleShema);

module.exports = GoogleModel;
