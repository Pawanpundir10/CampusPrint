import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Public
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

// Student
import Shops from "./pages/student/Shops";
import NewOrder from "./pages/student/NewOrder";
import MyOrders from "./pages/student/MyOrders";
import OrderDetail from "./pages/student/OrderDetail";

// Shop Admin
import ShopSetup from "./pages/admin/ShopSetup";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import Earnings from "./pages/admin/Earnings";

// Super Admin
import SuperDashboard from "./pages/superadmin/SuperDashboard";
import SuperShops from "./pages/superadmin/SuperShops";
import SuperUsers from "./pages/superadmin/SuperUsers";

// Layouts
import Navbar from "./components/common/Navbar";
import StudentSidebar from "./components/common/StudentSidebar";
import AdminSidebar from "./components/common/AdminSidebar";
import SuperAdminSidebar from "./components/common/SuperAdminSidebar";

const StudentLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gray-50">
    <StudentSidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gray-50">
    <AdminSidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

const SuperAdminLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gray-50">
    <SuperAdminSidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

// Guard — redirect based on role after login
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  // Wait for localStorage to be read before deciding to redirect
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === "superAdmin") return <Navigate to="/superadmin" replace />;
    if (user.role === "admin") return <Navigate to="/admin/orders" replace />;
    return <Navigate to="/student/shops" replace />;
  }
  return children;
};

export default function App() {
  const { user, loading } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

        {/* Student */}
        <Route path="/student/shops" element={<PrivateRoute role="student"><StudentLayout><Shops /></StudentLayout></PrivateRoute>} />
        <Route path="/student/new-order" element={<PrivateRoute role="student"><StudentLayout><NewOrder /></StudentLayout></PrivateRoute>} />
        <Route path="/student/orders" element={<PrivateRoute role="student"><StudentLayout><MyOrders /></StudentLayout></PrivateRoute>} />
        <Route path="/student/orders/:id" element={<PrivateRoute role="student"><StudentLayout><OrderDetail /></StudentLayout></PrivateRoute>} />

        {/* Shop Admin */}
        <Route path="/admin/shop" element={<PrivateRoute role="admin"><AdminLayout><ShopSetup /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute role="admin"><AdminLayout><AdminOrders /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/orders/:id" element={<PrivateRoute role="admin"><AdminLayout><AdminOrderDetail /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/earnings" element={<PrivateRoute role="admin"><AdminLayout><Earnings /></AdminLayout></PrivateRoute>} />

        {/* Super Admin */}
        <Route path="/superadmin" element={<PrivateRoute role="superAdmin"><SuperAdminLayout><SuperDashboard /></SuperAdminLayout></PrivateRoute>} />
        <Route path="/superadmin/shops" element={<PrivateRoute role="superAdmin"><SuperAdminLayout><SuperShops /></SuperAdminLayout></PrivateRoute>} />
        <Route path="/superadmin/users" element={<PrivateRoute role="superAdmin"><SuperAdminLayout><SuperUsers /></SuperAdminLayout></PrivateRoute>} />

        {/* Catch-all: redirect based on role */}
        <Route path="*" element={
          loading ? null
            : user?.role === "superAdmin" ? <Navigate to="/superadmin" replace />
              : user?.role === "admin" ? <Navigate to="/admin/orders" replace />
                : user?.role === "student" ? <Navigate to="/student/shops" replace />
                  : <Navigate to="/" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}