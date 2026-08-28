import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, required: true },
      streetAddress: { type: String, required: true },
      postalCode: { type: String, default: "" },
      deliveryInstructions: { type: String, default: "" },
    },
    deliveryMethod: {
      type: String,
      enum: ["home_delivery", "store_pickup"],
      default: "home_delivery",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash", "nagad", "stripe", "sslcommerz"],
      default: "cod",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
