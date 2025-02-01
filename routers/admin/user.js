const express = require("express");
const router = express.Router();
// * import controller
const userController = require("../../controllers/user");

router.post("/login", userController.postLogin);
router.post("/sign-up", userController.postSignUp);
router.get("/count-users", userController.getCountUsers);

module.exports = router;
