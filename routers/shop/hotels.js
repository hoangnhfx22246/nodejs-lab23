const express = require("express");
const router = express.Router();
// * import controller
const hotelController = require("../../controllers/hotels");

//home
router.get("/homepage-info", hotelController.getHotelHomepageInfo);
router.post("/search", hotelController.postSearchHotel);
router.get("/hotel/:id", hotelController.getHotel);
module.exports = router;
