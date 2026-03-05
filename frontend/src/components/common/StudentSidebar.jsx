import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  {
    to: "/student/shops",
    label: "Shops",
    d: "M3 7h18M3 12h18M3 17h18",
  },
  {
    to: "/student/orders",
    label: "My Orders",
    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h4m-4 4h4m-8-4h.01m-.01 4h.01",
  },
  {
    to: "/student/new-order",
    label: "New Order",
    d: "M12 4v16m8-8H4",
  },
];

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-60 min-h-screen bg-gray-950 flex flex-col border-r border-gray-800">
      {/* Logo + user */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 17H17.01M3 7h11M3 11h11M3 15h7M19 9l-4 4-2-2"
              />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base">
            Campus<span className="text-orange-400">Print</span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.name}
            </p>
            <p className="text-gray-500 text-xs">Student</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {NAV.map(({ to, label, d }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-500/10 text-white border border-orange-500/60"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent"
              }`
            }
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-900 group-hover:bg-gray-800 text-orange-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={d}
                />
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-all border border-transparent hover:border-red-500/40"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 text-gray-300">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;

