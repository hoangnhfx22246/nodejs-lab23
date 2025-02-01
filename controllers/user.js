const User = require("../models/User");
const authController = require("./authenticate");

exports.postLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please enter full information" });
  }

  // Kiểm tra người dùng tồn tại
  User.findOne({ username: username, password: password })
    .select("-password")
    .then((user) => {
      // * nếu không tồn tại người dùng
      if (!user)
        return res.status(400).json({
          message: "username does not exist or password is incorrect",
        });
      // * trả lại dữ liệu cho người dùng
      console.log(user);

      return res.status(200).json({
        message: "Đăng nhập thành công",
        result: {
          user,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        message: "opp! Something went wrong",
      });
    });
};
exports.postSignUp = async (req, res) => {
  const { username, password, fullName, phoneNumber, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please enter full information" });
  }
  try {
    // Kiểm tra người dùng tồn tại
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ message: "username already exists" });
    }
    const existingUserEmail = await User.findOne({ email: email });
    if (existingUserEmail) {
      return res.status(400).json({ message: "email already exists" });
    }

    const newUser = new User({
      username: username,
      password: password,
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email,
    });
    await newUser.save();
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "server error", error });
    console.log(error);
  }
};
exports.getCountUsers = async (req, res) => {
  const countUsers = await User.countDocuments({ isAdmin: false });
  res.status(200).json({ results: countUsers });
};
