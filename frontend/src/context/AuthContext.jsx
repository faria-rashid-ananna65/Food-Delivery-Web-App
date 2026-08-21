import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await API.get("/auth/me");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signup = async (name, email, password) => {
    const { data } = await API.post("/auth/signup", { name, email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  };

  const verifyOTP = async (userId, otp) => {
    const { data } = await API.post("/auth/verify-otp", { userId, otp });
    setUser(data.user);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  };

  const resendOTP = async (userId) => {
    const { data } = await API.post("/auth/resend-otp", { userId });
    return data;
  };

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    setUser(data.user);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  };

  const logout = async () => {
    try {
      await API.get("/auth/logout");
    } catch {
      // ignore error
    }
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put("/auth/update-profile", profileData);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        verifyOTP,
        resendOTP,
        updateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
