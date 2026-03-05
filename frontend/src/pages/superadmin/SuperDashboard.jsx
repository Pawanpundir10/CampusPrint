import { useState, useEffect } from "react";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import { fmt } from "../../utils/helpers";

const Stat = ({ icon, label, value, color }) => (
    <div className="card p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
        <div>
            <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);

export default function SuperDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/superadmin/stats").then(({ data }) => setStats(data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-gray-400 mt-1">Welcome back, Pawan 👋</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat icon="👥" label="Total Users" value={stats.totalUsers} color="bg-blue-50" />
                <Stat icon="🎓" label="Students" value={stats.totalStudents} color="bg-purple-50" />
                <Stat icon="🏪" label="Shop Admins" value={stats.totalShopAdmins} color="bg-orange-50" />
                <Stat icon="🖨️" label="Total Orders" value={stats.totalOrders} color="bg-green-50" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat icon="⏳" label="Pending Shops" value={stats.pendingShops} color="bg-amber-50" />
                <Stat icon="✅" label="Active Shops" value={stats.activeShops} color="bg-green-50" />
                <Stat icon="🏪" label="Total Shops" value={stats.totalShops} color="bg-gray-100" />
                <Stat icon="💰" label="Platform Earnings" value={fmt(stats.totalEarnings)} color="bg-emerald-50" />
            </div>

            {stats.pendingShops > 0 && (
                <div className="mt-6 card p-4 bg-amber-50 border-amber-200 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-semibold text-amber-800">{stats.pendingShops} shop{stats.pendingShops > 1 ? "s" : ""} waiting for verification</p>
                        <p className="text-amber-600 text-sm">Go to Shops → Pending to review them</p>
                    </div>
                </div>
            )}
        </div>
    );
}