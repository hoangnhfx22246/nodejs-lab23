const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/transaction");

router.post("/add-new", transactionController.postTransaction);
router.get("/get-transactions", transactionController.getTransactions);

module.exports = router;
