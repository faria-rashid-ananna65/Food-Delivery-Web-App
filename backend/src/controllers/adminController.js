import Order from "../models/Order.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" });
    const confirmedOrders = await Order.countDocuments({ orderStatus: "confirmed" });
    const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        confirmedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
