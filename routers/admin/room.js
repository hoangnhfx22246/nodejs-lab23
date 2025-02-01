const express = require("express");
const router = express.Router();
// * import controller
const roomController = require("../../controllers/room");

router.get("/all", roomController.getRooms);
router.delete("/room/:id", roomController.deleteRoom);
router.post("/room", roomController.postRoom);
router.put("/room/:id", roomController.postRoom);
router.get("/room/:id", roomController.getRoom);

module.exports = router;
