import { useState, useEffect } from "react";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmtDateTime } from "../../utils/helpers";

const TABS = ["all", "pending", "approved", "rejected"];

const statusStyle = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function SuperShops() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");
    const [toast, setToast] = useState(null);
    const [rejectModal, setRejectModal] = useState(null); // shopId
    const [rejectReason, setRejectReason] = useState("");

    const fetch = () => {
        setLoading(true);
        const q = tab !== "all" ? `?status=${tab}` : "";
        API.get(`/superadmin/shops${q}`)
            .then(({ data }) => setShops(data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, [tab]);

    const approve = async (id) => {
        try {
            await API.put(`/superadmin/shops/${id}/approve`);
            setToast({ message: "✅ Shop approved! Owner notified.", type: "success" });
            fetch();
        } catch (e) { setToast({ message: e.response?.data?.message || "Failed", type: "error" }); }
    };

    const reject = async () => {
        try {
            await API.put(`/superadmin/shops/${rejectModal}/reject`, { reason: rejectReason });
            setToast({ message: "Shop rejected. Owner notified.", type: "success" });
            setRejectModal(null); setRejectReason("");
            fetch();
        } catch (e) { setToast({ message: e.response?.data?.message || "Failed", type: "error" }); }
    };

    const remove = async (id, name) => {
        if (!confirm(`Delete shop "${name}"? This cannot be undone.`)) return;
        try {
            await API.delete(`/superadmin/shops/${id}`);
            setToast({ message: "Shop deleted", type: "success" });
            fetch();
        } catch (e) { setToast({ message: e.response?.data?.message || "Failed", type: "error" }); }
    };

    return (
        <div className="p-6">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Reject modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="font-display font-bold text-lg text-gray-900 mb-3">Reject Shop</h3>
                        <p className="text-gray-500 text-sm mb-4">Provide a reason — this will be emailed to the shop owner.</p>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                            placeholder="e.g. Incomplete information, invalid location..." className="input mb-4 resize-none" />
                        <div className="flex gap-3">
                            <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="btn-ghost flex-1">Cancel</button>
                            <button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
                                Send Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Shops</h1>
                    <p className="text-gray-400 text-sm mt-0.5">{shops.length} shop{shops.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
                            }`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                : shops.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-4xl mb-3">🏪</p>
                        <p>No shops found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {shops.map(shop => (
                            <div key={shop._id} className="card p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 flex-wrap mb-2">
                                            <span className="font-display font-bold text-gray-900 text-lg">{shop.shopName}</span>
                                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${statusStyle[shop.verificationStatus]}`}>
                                                {shop.verificationStatus}
                                            </span>
                                            {shop.isOpen && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🟢 Open</span>}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">📍 {shop.collegeName}{shop.location ? ` · ${shop.location}` : ""}</p>
                                        <p className="text-sm text-gray-500 mb-1">
                                            👤 <strong>{shop.ownerId?.name}</strong> · {shop.ownerId?.email}
                                            {shop.ownerId?.phone && ` · 📞 ${shop.ownerId.phone}`}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            B/W ₹{shop.bwPrice}/pg · Color ₹{shop.colorPrice}/pg · Submitted {fmtDateTime(shop.createdAt)}
                                        </p>
                                        {shop.verificationNote && (
                                            <p className="text-xs text-red-500 mt-1.5">Rejection note: {shop.verificationNote}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[150px]">
                                        {shop.verificationStatus === "pending" && (
                                            <>
                                                <button onClick={() => approve(shop._id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all">
                                                    ✅ Approve
                                                </button>
                                                <button onClick={() => setRejectModal(shop._id)}
                                                    className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all">
                                                    ❌ Reject
                                                </button>
                                            </>
                                        )}
                                        {shop.verificationStatus === "approved" && (
                                            <button onClick={() => setRejectModal(shop._id)}
                                                className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all">
                                                🚫 Revoke
                                            </button>
                                        )}
                                        {shop.verificationStatus === "rejected" && (
                                            <button onClick={() => approve(shop._id)}
                                                className="bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all">
                                                ✅ Approve
                                            </button>
                                        )}
                                        <button onClick={() => remove(shop._id, shop.shopName)}
                                            className="bg-gray-50 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold py-2 px-4 rounded-xl transition-all">
                                            🗑️ Delete
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