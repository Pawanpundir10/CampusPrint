import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17H17.01M3 7h11M3 11h11M3 15h7M19 9l-4 4-2-2"/>
      </svg>
    </div>
    <span className="font-display font-bold text-lg text-gray-900">Campus<span className="text-orange-500">Print</span></span>
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dash =
    user?.role === "superAdmin"
      ? "/superadmin"
      : user?.role === "admin"
        ? "/admin/orders"
        : "/student/shops";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span
                className={`hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user.role === "superAdmin"
                    ? "bg-purple-50 text-purple-700"
                    : user.role === "admin"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-orange-50 text-orange-700"
                }`}
              >
                {user.role === "superAdmin"
                  ? "Super Admin"
                  : user.role === "admin"
                    ? "Admin"
                    : "Student"}
              </span>
              <span className="hidden sm:block text-sm text-gray-600 font-medium truncate max-w-[140px]">
                {user.name}
              </span>

              {/* Student quick nav */}
              {user.role === "student" && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/student/shops"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
                  >
                    Shops
                  </Link>
                  <Link
                    to="/student/orders"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/student/new-order"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    + New Order
                  </Link>
                </div>
              )}

              {/* Default dashboard button for admins / super admin */}
              {user.role !== "student" && (
                <Link to={dash} className="btn-dark text-sm px-4 py-2">
                  Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm px-4 py-2">Sign In</Link>
              <Link to="/register" className="btn-orange text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
