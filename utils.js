const bcrypt = require("bcrypt");

const hashedPassword = (password) => {
  const hashValue = bcrypt.hashSync(password, 8);
  return hashValue;
};

const comparePassword = (password, hash) => {
  const correct = bcrypt.compareSync(password, hash);

  return correct;
};

module.exports = {
  hashedPassword,
  comparePassword,
};
