const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  UnAuthenticatedError,
  CustomApiError,
} = require("../errors/custom-error");

//*LOGIN USER
const login = async (req, res) => {
  console.log("logging");
  const USER = req.body;
  const user = await User.findOne({ username: USER.username });
  if (!user)
    throw new UnAuthenticatedError(`no user with username ${USER.username}`);
  const PasswordMatches = await bcrypt.compare(USER.password, user.password);
  if (!PasswordMatches) throw new UnAuthenticatedError("password do not match");

  const { username, email, fullname, _id } = user;
  const token = jwt.sign({ username, _id }, process.env.JWT_SECRET);
  res.status(201).json({ token, user: { username, fullname, email, _id } });
};

//*VERIFY USER
const getUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user)
    throw new CustomApiError("some thing went wrong please log in again");
  const { username, email, fullname, _id } = user;
  const token = jwt.sign({ username, _id }, process.env.JWT_SECRET);
  res.status(201).json({ token, user: { username, fullname, email, _id } });
};

//*REGISTER USER
const register = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  const user = await User.create({ ...req.body, password });
  const { username, email, fullname, _id } = user;
  const token = jwt.sign({ username, _id }, process.env.JWT_SECRET);
  res.status(201).json({ token, user: { username, fullname, email, _id } });
};
module.exports = { login, getUser, register };
