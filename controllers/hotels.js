const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Transaction = require("../models/Transaction");

exports.getHotelHomepageInfo = async (req, res) => {
  try {
    // Số lượng khách sạn theo khu vực
    const hotelsByCity = await Hotel.aggregate([
      {
        $match: { city: { $in: ["Ha Noi", "Ho Chi Minh", "Da Nang"] } },
      },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);

    // Số lượng khách sạn theo từng loại
    const hotelsByType = await Hotel.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Top 3 khách sạn có rating cao nhất
    const topRatedHotels = await Hotel.find().sort({ rating: -1 }).limit(3);

    res.status(200).json({
      hotelsByCity,
      hotelsByType,
      topRatedHotels,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching homepage information", error });
  }
};
exports.postSearchHotel = async (req, res) => {
  const { destination, date, options } = req.body;

  let availableHotels = [];
  let filteredHotels = [];
  try {
    const hotels = await Hotel.searchByDestination(destination);
    if (date?.startDate && date?.endDate) {
      availableHotels = await Hotel.searchByTransactionsDate(
        date.startDate,
        date.endDate,
        hotels
      );
    } else {
      availableHotels = [...hotels];
    }

    if (options) {
      const countPeoples = options.adult + options.children;
      const countRooms = options.room;
      filteredHotels = Hotel.searchByOption(
        countPeoples,
        countRooms,
        availableHotels
      );
    } else {
      filteredHotels = [...availableHotels];
    }
    res.status(200).json({ results: filteredHotels });
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    res.status(500).json({ error: "Lỗi khi tìm kiếm khách sạn." });
  }
};

exports.getHotel = async (req, res) => {
  try {
    const idHotel = req.params.id;

    const hotel = await Hotel.findById(idHotel).populate("rooms");

    res.status(200).json({ results: hotel });
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm khách sạn." });
  }
};
exports.getHotels = async (req, res) => {
  const { page = 1, limit } = req.query; // Mặc định page = 1 nếu không có tham số
  const skip = (page - 1) * limit; // Số lượng tài liệu cần bỏ qua để lấy trang hiện tại
  try {
    const totalItems = await Hotel.countDocuments();
    const hotels = await Hotel.find()
      .skip(skip) // Bỏ qua tài liệu để lấy trang mong muốn
      .limit(Number(limit)); // Giới hạn số lượng tài liệu trên mỗi trang;
    res.status(200).json({
      results: hotels,
      totalItems, // Tổng số lượng giao dịch
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.log("Error in postHotel:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.deleteHotel = async (req, res) => {
  const idHotel = req.params.id;
  try {
    // Kiểm tra xem có giao dịch nào liên quan đến khách sạn này không
    const transactions = await Transaction.find({ hotel: idHotel });
    if (transactions.length > 0) {
      return res
        .status(400)
        .json({ message: "Hotel already has transaction. Cannot delete!" });
    }

    // Xóa khách sạn nếu không có giao dịch liên quan
    const result = await Hotel.deleteOne({ _id: idHotel });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    res.status(200).json({ message: "Hotel has been deleted" });
  } catch (error) {
    console.log("Error in postHotel:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.postHotel = async (req, res) => {
  const idHotel = req.params.id;
  const {
    name,
    cheapestPrice,
    type,
    city,
    address,
    distance,
    photos,
    desc,
    featured,
    rooms,
  } = req.body;

  // Kiểm tra các trường bắt buộc
  if (
    !name ||
    !cheapestPrice ||
    !type ||
    !city ||
    !address ||
    !distance ||
    !photos ||
    !desc ||
    !rooms
  ) {
    return res.status(400).json({ message: "Must fill in all information" });
  }
  if (!Number(cheapestPrice) || !Number(distance)) {
    return res
      .status(400)
      .json({ message: "Distance and cheapestPrice must be number" });
  }

  // Lấy danh sách enum từ schema của model Hotel
  const hotelTypeEnum = Hotel.schema.path("type").enumValues;
  if (!hotelTypeEnum.includes(type)) {
    return res
      .status(400)
      .json({ message: `Type must be one of the values ${hotelTypeEnum}` });
  }

  try {
    // Lấy danh sách ID của các phòng dựa trên tiêu đề phòng
    const roomIds = await Room.find({ title: { $in: rooms } }).select("_id");
    if (roomIds.length === 0) {
      return res.status(400).json({ message: "Rooms do not exist" });
    }

    if (!idHotel) {
      // Tạo mới khách sạn nếu không có idHotel
      await Hotel.create({
        name,
        cheapestPrice,
        type,
        city,
        address,
        distance,
        photos,
        desc,
        featured,
        rooms: roomIds,
      });
    } else {
      // Cập nhật khách sạn nếu có idHotel
      const updatedHotel = await Hotel.findByIdAndUpdate(idHotel, {
        name,
        cheapestPrice,
        type,
        city,
        address,
        distance,
        photos,
        desc,
        featured,
        rooms: roomIds,
      });

      if (!updatedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
    }

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log("Error in postHotel:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
