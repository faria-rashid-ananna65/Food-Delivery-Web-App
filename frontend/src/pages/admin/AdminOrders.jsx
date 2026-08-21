import { useState, useEffect } from "react";
import API from "../../api/axios";
import EmptyState from "../../components/EmptyState";
import {
  Search, Clock, CheckCircle, Truck, XCircle, Package, Utensils,
} from "lucide-react";
import toast from "react-hot-toast";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
  { value: "preparing", label: "Preparing", icon: Utensils, color: "text-orange-600 bg-orange-50" },
  { value: "on_the_way", label: "On the Way", icon: Truck, color: "text-purple-600 bg-purple-50" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?status=${filter}` : "";
      const { data } = await API.get(`/orders/admin/all${params}`);
      setOrders(data.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, field, value) => {
    try {
      const body = field === "orderStatus"
        ? { orderStatus: value }
        : { paymentStatus: value };
      await API.put(`/orders/${orderId}/status`, body);
      toast.success(`${field === "orderStatus" ? "Order" : "Payment"} status updated`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      order.deliveryAddress?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusConfig = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track all orders</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === option.value
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={search ? "Try a different search" : "No orders match this filter"}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusCfg = getStatusConfig(order.orderStatus);
            const StatusIcon = statusCfg.icon || Clock;

            return (
              <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {order.user && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer: {order.user.name} ({order.user.email})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === "paid"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"}
                        alt={item.name}
                        className="w-7 h-7 rounded object-cover"
                      />
                      <span className="text-xs text-gray-700">
                        {item.name} x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {order.deliveryAddress && (
                  <div className="text-xs text-gray-500 mb-3 p-2.5 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-700">{order.deliveryAddress.fullName} &middot; {order.deliveryAddress.phone}</p>
                    <p>{order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}, {order.deliveryAddress.district}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{order.deliveryMethod === "store_pickup" ? "Pickup" : "Delivery"}</span>
                    <span>&middot;</span>
                    <span>{order.paymentMethod === "cod" ? "COD" : order.paymentMethod?.toUpperCase()}</span>
                    {order.couponCode && (
                      <>
                        <span>&middot;</span>
                        <span className="text-green-600">Coupon: {order.couponCode}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary-600">
                      ${order.total.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, "orderStatus", e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="on_the_way">On the Way</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateStatus(order._id, "paymentStatus", e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
