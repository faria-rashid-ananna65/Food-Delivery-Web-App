import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const DIVISION_FEE = {
  dhaka: 60,
  chittagong: 120,
  rajshahi: 100,
  khulna: 110,
  sylhet: 130,
  barishal: 120,
  rangpur: 140,
  mymenshing: 100,
};

const TAX_RATE = 0.05;

export const createOrder = async (req, res, next) => {
  try {
    const {
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      couponCode,
    } = req.body;

    if (
      !deliveryAddress?.fullName ||
      !deliveryAddress?.phone ||
      !deliveryAddress?.division ||
      !deliveryAddress?.district ||
      !deliveryAddress?.area ||
      !deliveryAddress?.streetAddress
    ) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.menu",
      "name price image isAvailable"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.menu.isAvailable) {
        return res.status(400).json({
          message: `${item.menu.name} is no longer available`,
        });
      }
    }

    const orderItems = cart.items.map((item) => ({
      menu: item.menu._id,
      name: item.menu.name,
      price: item.menu.price,
      quantity: item.quantity,
      image: item.menu.image,
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee =
      deliveryMethod === "store_pickup"
        ? 0
        : DIVISION_FEE[deliveryAddress.division?.toLowerCase()] || 80;

    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

    let discount = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase();
      if (code === "SAVE10") {
        discount = Math.round(subtotal * 0.1 * 100) / 100;
      } else if (code === "FLAT50") {
        discount = Math.min(50, subtotal);
      } else if (code === "FREESHIP") {
        discount = deliveryFee;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee + tax - discount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        email: deliveryAddress.email || "",
        division: deliveryAddress.division,
        district: deliveryAddress.district,
        area: deliveryAddress.area,
        streetAddress: deliveryAddress.streetAddress,
        postalCode: deliveryAddress.postalCode || "",
        deliveryInstructions: deliveryAddress.deliveryInstructions || "",
      },
      deliveryMethod: deliveryMethod || "home_delivery",
      paymentMethod: paymentMethod || "cod",
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      couponCode: couponCode || "",
      orderStatus: "pending",
      paymentStatus: "unpaid",
    });

    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email"
    );

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.menu", "name image")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const validOrderStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "on_the_way",
      "delivered",
      "cancelled",
    ];
    const validPaymentStatuses = ["unpaid", "paid", "refunded"];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email"
    );
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};
