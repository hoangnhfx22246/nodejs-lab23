const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      fullName: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    room: [
      {
        type: Number,
        required: true,
      },
    ],
    dateStart: {
      type: Schema.Types.Date,
      required: true,
    },
    dateEnd: {
      type: Schema.Types.Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    payment: {
      type: String,
      required: true,
      enum: ["Credit Card", "Cash"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Booked", "Checkin", "Checkout"],
      default: "Booked",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Transaction", transactionSchema);
