const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");

require("dotenv").config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clusternodejs.7bqsu.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

// * import routers
// * home
const userRouter = require("./routers/shop/user");
const hotelRouter = require("./routers/shop/hotels");
const roomRouter = require("./routers/shop/room");
const transactionRouter = require("./routers/shop/transaction");
// * admin
const authController = require("./controllers/authenticate");
const userAdminRouter = require("./routers/admin/user");
const hotelAdminRouter = require("./routers/admin/hotels");
const roomAdminRouter = require("./routers/admin/room");
const transactionAdminRouter = require("./routers/admin/transaction");

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());

// * router home shop
app.use("/user", userRouter);
app.use("/hotels", hotelRouter);
app.use("/rooms", roomRouter);
app.use("/transaction", transactionRouter);

// * router admin shop
app.use(authController.checkUserAdmin);
app.use("/admin/user", userAdminRouter);
app.use("/admin/hotels", hotelAdminRouter);
app.use("/admin/rooms", roomAdminRouter);
app.use("/admin/transaction", transactionAdminRouter);

mongoose
  .connect(uri)
  .then(() => {
    app.listen(process.env.PORT_DEFAULT || 3000, () => {
      console.log("listening on port " + process.env.PORT_DEFAULT || 3000);
    });
  })
  .catch((err) => {
    console.log(err);
  });
