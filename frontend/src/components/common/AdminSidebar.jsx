import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to:"/admin/orders",   label:"Orders",   d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { to:"/admin/shop",     label:"My Shop",  d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to:"/admin/earnings", label:"Earnings", d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-60 min-h-screen bg-gray-950 flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17H17.01M3 7h11M3 11h11M3 15h7M19 9l-4 4-2-2"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base">Campus<span className="text-orange-400">Print</span></span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs">Shop Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {NAV.map(({ to, label, d }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              isActive
                ? "bg-orange-500/10 text-white border border-orange-500/60"
                : "text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent"
            }`
          }>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              "bg-gray-900 group-hover:bg-gray-800 " +
              (to === "/admin/orders"
                ? "text-orange-400"
                : to === "/admin/earnings"
                  ? "text-emerald-400"
                  : "text-gray-300")
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d}/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">{label}</span>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
export default AdminSidebar;
