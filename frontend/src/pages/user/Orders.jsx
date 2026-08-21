import { useState, useEffect } from "react";
import API from "../../api/axios";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Package, Clock, CheckCircle, Truck, XCircle, MapPin,
  CreditCard, Calendar, Utensils, ChevronDown, ChevronUp,
} from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Utensils },
  { key: "on_the_way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusColors = {
  pending: "text-yellow-500 bg-yellow-50 border-yellow-200",
  confirmed: "text-blue-500 bg-blue-50 border-blue-200",
  preparing: "text-orange-500 bg-orange-50 border-orange-200",
  on_the_way: "text-purple-500 bg-purple-50 border-purple-200",
  delivered: "text-green-500 bg-green-50 border-green-200",
  cancelled: "text-red-500 bg-red-50 border-red-200",
};

const activeColor = {
  pending: "text-yellow-600 bg-yellow-100 border-yellow-400",
  confirmed: "text-blue-600 bg-blue-100 border-blue-400",
  preparing: "text-orange-600 bg-orange-100 border-orange-400",
  on_the_way: "text-purple-600 bg-purple-100 border-purple-400",
  delivered: "text-green-600 bg-green-100 border-green-400",
};

const paymentLabels = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  stripe: "Stripe",
  sslcommerz: "SSLCommerz",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/my-orders");
      setOrders(data.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveStep = (status) => {
    if (status === "cancelled") return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        <p className="text-xs text-gray-500">Track your order status</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Place your first order and it will appear here"
          action={
            <a
              href="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Browse Menu
            </a>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const activeStep = getActiveStep(order.orderStatus);
            const isExpanded = expandedOrder === order._id;
            const isCancelled = order.orderStatus === "cancelled";

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary-600">
                        ${order.total.toFixed(2)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                        <XCircle className="w-3 h-3" />
                        Cancelled
                      </span>
                    ) : (
                      statusSteps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isActive = idx === activeStep;
                        const isDone = idx < activeStep;

                        return (
                          <div key={step.key} className="flex items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                isActive
                                  ? activeColor[step.key]
                                  : isDone
                                  ? "text-green-600 bg-green-100 border-green-400"
                                  : "text-gray-300 bg-gray-50 border-gray-200"
                              }`}
                              title={step.label}
                            >
                              <StepIcon className="w-3.5 h-3.5" />
                            </div>
                            {idx < statusSteps.length - 1 && (
                              <div
                                className={`w-4 h-0.5 ${
                                  idx < activeStep ? "bg-green-400" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              x{item.quantity} &middot; ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-600">
                          <p className="font-medium">
                            {order.deliveryAddress.fullName} &middot;{" "}
                            {order.deliveryAddress.phone}
                          </p>
                          <p>
                            {order.deliveryAddress.streetAddress},{" "}
                            {order.deliveryAddress.area},{" "}
                            {order.deliveryAddress.district},{" "}
                            {order.deliveryAddress.division}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {order.deliveryMethod === "store_pickup"
                            ? "Pickup"
                            : "Home Delivery"}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {paymentLabels[order.paymentMethod] || order.paymentMethod}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${order.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{order.deliveryFee === 0 ? "Free" : `$${order.deliveryFee?.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT</span>
                        <span>${order.tax?.toFixed(2)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-gray-800 text-sm pt-1 border-t border-gray-100">
                        <span>Total</span>
                        <span className="text-primary-600">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
