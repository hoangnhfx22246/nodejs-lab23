const User = require("../models/User");

exports.checkUserAdmin = async (req, res, next) => {
  const userID = req.headers.authorization;

  try {
    const user = await User.findById(userID);

    if (user && user.isAdmin) {
      return next();
    }

    return res.status(403).json({ message: "Access denied. Admins only." });
  } catch (error) {
    console.log("Error in checkUserAdmin:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
