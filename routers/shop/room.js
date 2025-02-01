const express = require("express");
const router = express.Router();
// * import controller
const roomController = require("../../controllers/room");

router.post("/available-room-by-date", roomController.getAvailableRoomByDate);

module.exports = router;
