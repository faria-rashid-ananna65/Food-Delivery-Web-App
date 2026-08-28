import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoadingSpinner from "./components/LoadingSpinner";

import Home from "./pages/user/Home";
import Menu from "./pages/user/Menu";
import Category from "./pages/user/Category";
import Contact from "./pages/user/Contact";
import Cart from "./pages/user/Cart";
import PlaceOrder from "./pages/user/PlaceOrder";
import Orders from "./pages/user/Orders";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyOTP from "./pages/auth/VerifyOTP";
import AdminLogin from "./pages/auth/AdminLogin";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminCategory from "./pages/admin/AdminCategory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMessages from "./pages/admin/AdminMessages";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 0.2,
      ease: "power2.out",
    });
  }, [pathname]);

  return null;
}

function App() {
  const { loading } = useAuth();

  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = "smooth";

    const handleAnchorClick = (e) => {
      const href = e.target.closest("a")?.getAttribute("href");
      if (href?.startsWith("#")) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          gsap.to(window, {
            scrollTo: { y: el, offsetY: 80 },
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
        <Route path="/admin-login" element={<><Navbar /><AdminLogin /><Footer /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /><Footer /></>} />
        <Route path="/verify-otp" element={<><Navbar /><VerifyOTP /><Footer /></>} />

        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/menu" element={<><Navbar /><Menu /><Footer /></>} />
        <Route path="/category" element={<><Navbar /><Category /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Navbar /><Cart /><Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/place-order"
          element={
            <ProtectedRoute>
              <Navbar /><PlaceOrder /><Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Navbar /><Orders /><Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/menu" element={<AdminMenu />} />
                <Route path="/category" element={<AdminCategory />} />
                <Route path="/orders" element={<AdminOrders />} />
                <Route path="/messages" element={<AdminMessages />} />
              </Routes>
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
