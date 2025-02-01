const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/transaction");

router.get("/get-transactions", transactionController.getTransactions);
router.get("/count-transactions", transactionController.getCountTransactions);

module.exports = router;
