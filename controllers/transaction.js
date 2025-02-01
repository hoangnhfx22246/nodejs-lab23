const { query } = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.getTransactions = (req, res) => {
  const { page = 1, limit } = req.query; // Mặc định page = 1 và limit = 8 nếu không có tham số
  const idUser = req.headers.authorization;

  User.findById(idUser)
    .then((user) => {
      let query = {};
      if (!user.isAdmin) {
        query = { "user._id": idUser };
      }

      const skip = (page - 1) * limit; // Số lượng tài liệu cần bỏ qua để lấy trang hiện tại

      // Đếm tổng số lượng giao dịch phù hợp với điều kiện query
      Transaction.countDocuments(query)
        .then((totalItems) => {
          // Sau khi đếm xong, thực hiện truy vấn để lấy dữ liệu với phân trang
          Transaction.find(query)
            .populate("hotel")
            .skip(skip) // Bỏ qua tài liệu để lấy trang mong muốn
            .limit(Number(limit)) // Giới hạn số lượng tài liệu trên mỗi trang
            .then((transactions) => {
              res.status(200).json({
                results: transactions,
                totalItems, // Tổng số lượng giao dịch
                page: Number(page),
                limit: Number(limit),
              });
            })
            .catch((err) => {
              console.log("Lỗi tìm kiếm:", err);
              res.status(500).json({ error: "Lỗi khi tìm kiếm giao dịch." });
            });
        })
        .catch((err) => {
          console.log("Lỗi đếm tài liệu:", err);
          res.status(500).json({ error: "Lỗi khi đếm số lượng giao dịch." });
        });
    })
    .catch((err) => {
      console.log("Lỗi tìm kiếm người dùng:", err);
      res.status(500).json({ error: "Lỗi khi tìm kiếm người dùng." });
    });
};

exports.postTransaction = (req, res) => {
  const { user, hotel, room, dateStart, dateEnd, price, payment } = req.body;

  const transaction = new Transaction({
    user,
    hotel,
    room,
    dateStart,
    dateEnd,
    price,
    payment,
  });
  transaction
    .save()
    .then(() => {
      res.status(200).json({ message: "post success" });
    })
    .catch((err) => {
      console.log("Lỗi tìm kiếm:", err);
      res.status(500).json({ error: "Lỗi khi tìm kiếm khách sạn." });
    });
};
exports.getCountTransactions = async (req, res) => {
  const countTransactions = await Transaction.countDocuments();
  res.status(200).json({ results: countTransactions });
};
