import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  MapPin, Truck, CreditCard, ShoppingBag, ArrowLeft,
  Tag, CheckCircle, Home, Store, Banknote, Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";

const DIVISIONS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna",
  "Sylhet", "Barishal", "Rangpur", "Mymensingh",
];

const DIVISION_FEE = {
  dhaka: 60, chittagong: 120, rajshahi: 100, khulna: 110,
  sylhet: 130, barishal: 120, rangpur: 140, mymenshing: 100,
};

const TAX_RATE = 0.05;

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
  { id: "bkash", label: "bKash", icon: Smartphone, desc: "Mobile payment" },
  { id: "nagad", label: "Nagad", icon: Smartphone, desc: "Mobile payment" },
  { id: "stripe", label: "Stripe", icon: CreditCard, desc: "Card payment", placeholder: true },
  { id: "sslcommerz", label: "SSLCommerz", icon: CreditCard, desc: "Online payment", placeholder: true },
];

const PlaceOrder = () => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      division: "",
      district: "",
      area: "",
      streetAddress: "",
      postalCode: "",
      deliveryInstructions: "",
    },
  });

  const selectedDivision = watch("division");

  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  useEffect(() => {
    if (user) {
      gsap.from(".place-order-left", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "all",
      });
      gsap.from(".place-order-right", {
        x: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
        clearProps: "all",
      });
    }
  }, [user]);

  if (!cart.items || cart.items.length === 0) {
    return <LoadingSpinner />;
  }

  const deliveryFee =
    deliveryMethod === "store_pickup"
      ? 0
      : DIVISION_FEE[selectedDivision?.toLowerCase()] || 80;

  const tax = Math.round(cartTotal * TAX_RATE * 100) / 100;
  const total = Math.max(0, cartTotal + deliveryFee + tax - couponDiscount);

  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    if (appliedCoupon) {
      toast.error("Coupon already applied. Remove it first.");
      return;
    }

    let discount = 0;
    if (code === "SAVE10") {
      discount = Math.round(cartTotal * 0.1 * 100) / 100;
    } else if (code === "FLAT50") {
      discount = Math.min(50, cartTotal);
    } else if (code === "FREESHIP") {
      discount = deliveryFee;
    } else {
      toast.error("Invalid coupon code");
      return;
    }

    setCouponDiscount(discount);
    setAppliedCoupon(code);
    toast.success(`Coupon applied! You save $${discount.toFixed(2)}`);
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const onSubmit = async (data) => {
    if (!cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (["stripe", "sslcommerz"].includes(paymentMethod)) {
      toast.error("This payment method is not available yet");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        deliveryAddress: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          division: data.division,
          district: data.district,
          area: data.area,
          streetAddress: data.streetAddress,
          postalCode: data.postalCode,
          deliveryInstructions: data.deliveryInstructions,
        },
        deliveryMethod,
        paymentMethod,
        couponCode: appliedCoupon,
      };

      const { data: result } = await API.post("/orders", orderData);

      if (result.success) {
        await clearCart();
        toast.success("Order placed successfully!");
        navigate("/orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/cart")}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Place Order</h1>
          <p className="text-xs text-gray-500">Complete your delivery details</p>
        </div>
      </div>

      <form id="place-order-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 place-order-left">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Delivery Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register("fullName", { required: "Name is required" })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...register("phone", { required: "Phone is required" })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Division *
                  </label>
                  <select
                    {...register("division", { required: "Division is required" })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Select Division</option>
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.division && (
                    <p className="mt-1 text-xs text-red-500">{errors.division.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    {...register("district", { required: "District is required" })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="District"
                  />
                  {errors.district && (
                    <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Area / City *
                  </label>
                  <input
                    type="text"
                    {...register("area", { required: "Area is required" })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Area or city"
                  />
                  {errors.area && (
                    <p className="mt-1 text-xs text-red-500">{errors.area.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Postal Code (optional)
                  </label>
                  <input
                    type="text"
                    {...register("postalCode")}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Postal code"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    {...register("streetAddress", { required: "Street address is required" })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="House No, Road, Building, etc."
                  />
                  {errors.streetAddress && (
                    <p className="mt-1 text-xs text-red-500">{errors.streetAddress.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Delivery Instructions (optional)
                  </label>
                  <textarea
                    {...register("deliveryInstructions")}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="E.g. Ring the doorbell, leave at reception..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Delivery Method</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("home_delivery")}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    deliveryMethod === "home_delivery"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Home className={`w-5 h-5 ${deliveryMethod === "home_delivery" ? "text-primary-600" : "text-gray-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Home Delivery</p>
                    <p className="text-xs text-gray-500">Delivered to your door</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("store_pickup")}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    deliveryMethod === "store_pickup"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Store className={`w-5 h-5 ${deliveryMethod === "store_pickup" ? "text-primary-600" : "text-gray-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Store Pickup</p>
                    <p className="text-xs text-gray-500">Pickup from store</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Payment Method</h2>
              </div>

              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      if (method.placeholder) {
                        toast.error(`${method.label} is coming soon`);
                        return;
                      }
                      setPaymentMethod(method.id);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === method.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${method.placeholder ? "opacity-60" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      paymentMethod === method.id ? "bg-primary-100" : "bg-gray-100"
                    }`}>
                      <method.icon className={`w-5 h-5 ${
                        paymentMethod === method.id ? "text-primary-600" : "text-gray-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                    )}
                    {method.placeholder && (
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 place-order-right">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Order Summary</h2>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                {cart.items.map((item) => {
                  if (!item.menu) return null;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <img
                        src={item.menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"}
                        alt={item.menu.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{item.menu.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        ${(item.menu.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      disabled={!!appliedCoupon}
                      className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {appliedCoupon} applied — you save ${couponDiscount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 text-sm border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-primary-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !cart.items || cart.items.length === 0}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Order — ${total.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                By placing this order you agree to our terms
              </p>
            </div>
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Total</span>
          <span className="text-lg font-bold text-primary-600">${total.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          form="place-order-form"
          disabled={loading || !cart.items || cart.items.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary-500/30"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Confirm Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PlaceOrder;
