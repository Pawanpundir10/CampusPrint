import { useState, useEffect } from "react";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmtDateTime } from "../../utils/helpers";

const ROLE_TABS = ["all", "student", "admin"];

const roleBadge = {
    student: "bg-blue-50 text-blue-700 border-blue-200",
    admin: "bg-orange-50 text-orange-700 border-orange-200",
    superAdmin: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function SuperUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);

    const fetch = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (tab !== "all") params.set("role", tab);
        if (search) params.set("search", search);
        API.get(`/superadmin/users?${params}`)
            .then(({ data }) => setUsers(data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, [tab]);
    useEffect(() => {
        const t = setTimeout(() => fetch(), 400);
        return () => clearTimeout(t);
    }, [search]);

    const toggle = async (id, name, isActive) => {
        const action = isActive ? "deactivate" : "reactivate";
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${name}"?`)) return;
        try {
            const { data } = await API.put(`/superadmin/users/${id}/toggle`);
            setToast({ message: data.message, type: "success" });
            fetch();
        } catch (e) { setToast({ message: e.response?.data?.message || "Failed", type: "error" }); }
    };

    const remove = async (id, name) => {
        if (!confirm(`Permanently delete "${name}"? All their data will be lost.`)) return;
        try {
            await API.delete(`/superadmin/users/${id}`);
            setToast({ message: "User deleted", type: "success" });
            fetch();
        } catch (e) { setToast({ message: e.response?.data?.message || "Failed", type: "error" }); }
    };

    return (
        <div className="p-6">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-400 text-sm mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Search + Tabs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email…" className="input flex-1" />
                <div className="flex gap-2">
                    {ROLE_TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
                                }`}>
                            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                : users.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-4xl mb-3">👥</p>
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user._id} className={`card p-4 ${!user.isActive ? "opacity-60" : ""}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900">{user.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadge[user.role]}`}>
                                                    {user.role}
                                                </span>
                                                {!user.isActive && <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Deactivated</span>}
                                                {!user.isEmailVerified && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unverified</span>}
                                            </div>
                                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                            <p className="text-xs text-gray-300">
                                                Joined {fmtDateTime(user.createdAt)}
                                                {user.collegeName && ` · ${user.collegeName}`}
                                                {user.shopId && ` · Shop: ${user.shopId.shopName} (${user.shopId.verificationStatus})`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => toggle(user._id, user.name, user.isActive)}
                                            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${user.isActive
                                                    ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                                    : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                }`}>
                                            {user.isActive ? "🚫 Deactivate" : "✅ Reactivate"}
                                        </button>
                                        <button onClick={() => remove(user._id, user.name)}
                                            className="text-xs font-semibold px-3 py-2 rounded-xl border bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}