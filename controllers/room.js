const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Transaction = require("../models/Transaction");

exports.getAvailableRoomByDate = async (req, res) => {
  const { idHotel, startDate, endDate } = req.body;
  try {
    if (!idHotel || !startDate || !endDate) {
      throw new Error("Invalid value");
    }
    const hotel = await Hotel.findById(idHotel).populate("rooms");

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

    res.status(200).json({ results: filteredAvailableRooms });
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    res.status(500).json({ error: "Lỗi khi tìm kiếm khách sạn." });
  }
};

exports.getRooms = async (req, res) => {
  const { page = 1, limit } = req.query; // Mặc định page = 1 nếu không có tham số
  const skip = (page - 1) * limit; // Số lượng tài liệu cần bỏ qua để lấy trang hiện tại
  try {
    const totalItems = await Room.countDocuments();
    const rooms = await Room.find()
      .skip(skip) // Bỏ qua tài liệu để lấy trang mong muốn
      .limit(Number(limit)); // Giới hạn số lượng tài liệu trên mỗi trang;
    res.status(200).json({
      results: rooms,
      totalItems, // Tổng số lượng giao dịch
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.log("Error in postHotel:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.deleteRoom = async (req, res) => {
  const idRoom = req.params.id;

  try {
    const hotelIds = await Hotel.find({ rooms: { $in: [idRoom] } }).select(
      "_id"
    );

    // Kiểm tra xem có giao dịch nào liên quan đến room này không
    const transactions = await Transaction.find({
      hotel: hotelIds,
    });

    if (transactions.length > 0) {
      return res
        .status(400)
        .json({ message: "Room already has transaction. Cannot delete!" });
    }

    // Xóa room nếu không có giao dịch liên quan
    const result = await Room.deleteOne({ _id: idRoom });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Room not found." });
    }

    res.status(200).json({ message: "Room has been deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.postRoom = async (req, res) => {
  const idRoom = req.params.id;
  const { title, desc, price, maxPeople, roomNumbers, hotel } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!title || !desc || !price || !maxPeople || !roomNumbers) {
    return res.status(400).json({ message: "Must fill in all information" });
  }
  if (!Number(price) || !Number(maxPeople)) {
    return res
      .status(400)
      .json({ message: "price and maxPeople must be number" });
  }
  // thêm id room vào Hotel
  if (hotel) {
    const existingHotel = await Hotel.findById(hotel);

    if (existingHotel) {
      // Kiểm tra nếu `idRoom` đã tồn tại trong `rooms`
      if (!existingHotel.rooms.includes(idRoom)) {
        existingHotel.rooms.push(idRoom); // Thêm `idRoom` vào danh sách `rooms`
        await existingHotel.save(); // Lưu thay đổi
      }
    }
  }

  try {
    if (!idRoom) {
      // Tạo mới khách sạn nếu không có idRoom
      await Room.create({
        title,
        price,
        maxPeople,
        desc,
        roomNumbers,
      });
    } else {
      // Cập nhật khách sạn nếu có idRoom
      const updatedRoom = await Room.findByIdAndUpdate(idRoom, {
        title,
        price,
        maxPeople,
        desc,
        roomNumbers,
      });

      if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
    }

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log("Error in postRoom:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const idRoom = req.params.id;

    const room = await Room.findById(idRoom);

    res.status(200).json({ results: room });
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm phòng." });
  }
};
