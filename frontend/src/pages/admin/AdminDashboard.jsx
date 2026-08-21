import { useState, useEffect } from "react";
import API from "../../api/axios";
import { ShoppingCart, Package, Clock, Truck, DollarSign, Users } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/dashboard");
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    {
      title: "Total Delivered",
      value: stats?.deliveredOrders || 0,
      icon: Truck,
      color: "bg-green-500",
      bgLight: "bg-green-50",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-50",
    },
    {
      title: "Confirmed Orders",
      value: stats?.confirmedOrders || 0,
      icon: Package,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-pink-500",
      bgLight: "bg-pink-50",
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-primary-500",
      bgLight: "bg-primary-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your food delivery business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgLight} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
