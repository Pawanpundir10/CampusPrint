import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const NAV = [
    { to: "/superadmin", icon: "📊", label: "Dashboard" },
    { to: "/superadmin/shops", icon: "🏪", label: "Shops" },
    { to: "/superadmin/users", icon: "👥", label: "Users" },
];

export default function SuperAdminSidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const doLogout = () => { logout(); navigate("/login"); };

    return (
        <div className="w-64 min-h-screen bg-gray-950 text-white flex flex-col flex-shrink-0">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-800">
                <span className="font-display text-xl font-black">Campus<span className="text-orange-500">Print</span></span>
                <div className="mt-1">
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                        ⚡ Super Admin
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map(n => (
                    <NavLink key={n.to} to={n.to} end={n.to === "/superadmin"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`
                        }>
                        <span className="text-lg">{n.icon}</span>
                        {n.label}
                    </NavLink>
                ))}
            </nav>

            {/* User info + logout */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button onClick={doLogout}
                    className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-red-500/10">
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}