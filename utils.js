const bcrypt = require("bcrypt");

const hashedPassword = (password) => {
  const hashValue = bcrypt.hashSync(password, 8);
  return hashValue;
};

const comparePassword = (password, hash) => {
  const correct = bcrypt.compareSync(password, hash);

  return correct;
};

const getUniqueFilename = (filename) => {
  const timestamp= Date.now()

  const extension = filename.split(".").pop();

  return `${timestamp}.${extension}`
}

const checkIfLiked = async (username, id, model) => {
  const object = await model.findById(id).lean()
  if (object.likes.length > 0) {
    for (let i = 0; i < object.likes.length; i++) {
      if (object.likes[i] === username) {
        return true
      }
      // else {
      //   return false
      // }
    }
  }
  // else {
  //   return false
  // }
}

module.exports = {
  hashedPassword,
  comparePassword,
  getUniqueFilename,
  checkIfLiked
};
