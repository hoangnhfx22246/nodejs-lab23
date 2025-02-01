const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authenticate");
// * import controller
const hotelController = require("../../controllers/hotels");

//admin
router.get("/all", hotelController.getHotels);
router.delete("/hotel/:id", hotelController.deleteHotel); // Thêm route DELETE
router.post("/hotel", hotelController.postHotel);
router.put("/hotel/:id", hotelController.postHotel);
router.get("/hotel/:id", hotelController.getHotel);
module.exports = router;
