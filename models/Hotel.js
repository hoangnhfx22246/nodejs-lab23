const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const Schema = mongoose.Schema;

const hotelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cheapestPrice: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["hotel", "apartments", "resorts", "villas", "cabins"],
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    photos: {
      type: [String],
    },
    desc: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);
hotelSchema.statics.searchByDestination = async function (destination) {
  let query = {};
  if (destination) {
    query = {
      ...query,
      $or: [
        { city: { $regex: destination, $options: "i" } },
        { address: { $regex: destination, $options: "i" } },
      ],
    };
  }
  try {
    return await this.find(query).populate("rooms");
  } catch (error) {
    throw error;
  }
};

//functions
hotelSchema.statics.searchByTransactionsDate = async function (
  startDate,
  endDate,
  hotels
) {
  // return hotels;
  const availableHotels = [];

  for (let hotel of hotels) {
    const availableRooms = await Promise.all(
      hotel.rooms.map(async (room) => {
        // Kiểm tra từng roomNumber trong room
        const availableRoomNumbers = await Promise.all(
          room.roomNumbers.map(async (roomNumber) => {
            const transactions = await Transaction.find({
              hotel: hotel["_id"],
              $or: [
                {
                  dateStart: { $lte: startDate },
                  dateEnd: { $gte: endDate },
                },
                {
                  dateStart: { $gte: startDate },
                  dateEnd: { $lte: endDate },
                },
              ],
              room: { $elemMatch: { $eq: roomNumber } },
            });

            // Nếu không có transaction nào, phòng này trống
            if (transactions.length === 0) {
              return roomNumber;
            }
            return null;
          })
        );

        // Lọc ra những roomNumber trống
        const filteredRoomNumbers = availableRoomNumbers.filter(
          (rn) => rn !== null
        );

        return {
          ...room.toObject(),
          roomNumbers: filteredRoomNumbers,
        };
      })
    );

    // Lọc ra những phòng có ít nhất 1 roomNumber trống
    const filteredAvailableRooms = availableRooms.filter(
      (room) => room.roomNumbers.length > 0
    );
    if (filteredAvailableRooms.length > 0) {
      availableHotels.push(hotel);
    }
  }
  return availableHotels;
};
hotelSchema.statics.searchByOption = function (
  countPeoples,
  countRooms,
  hotels
) {
  return hotels.filter((hotel) => {
    return (
      hotel.rooms.length >= countRooms &&
      hotel.rooms.filter((room) => {
        return room.maxPeople >= countPeoples;
      }).length > 0
    );
  });
};

module.exports = mongoose.model("Hotel", hotelSchema);
