import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmt, fmtDateTime, statusBadge, statusEmoji } from "../../utils/helpers";

const STATUSES = ["pending", "printing", "ready", "completed", "cancelled"];

const OrderRow = ({ order, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const doUpdate = async (status) => {
    setUpdating(true);
    await onStatusChange(order._id, status);
    setUpdating(false);
  };

  const s = order.orderStatus;

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-display font-bold text-gray-900">{order.studentId?.name || "Unknown"}</span>
            <span className={statusBadge(s)}>{statusEmoji[s]} {s}</span>
            <span className={statusBadge(order.paymentStatus)}>{order.paymentStatus}</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {order.studentId?.email}
            {order.studentId?.phone && ` · 📞 ${order.studentId.phone}`}
            {` · ${fmtDateTime(order.createdAt)}`}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {order.files?.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="font-bold text-orange-500">PDF</span>
                <span className="text-gray-600 truncate max-w-[100px]">{f.fileName}</span>
                <span className="text-gray-400">{f.pages}pg · {f.copies}x · {f.printType === "bw" ? "B/W" : "CLR"}</span>
              </div>
            ))}
            {order.files?.length > 3 && <span className="text-xs text-gray-400">+{order.files.length - 3} more</span>}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl text-gray-900">{fmt(order.totalAmount)}</span>
            <span className="text-xs text-gray-400">💵 Cash</span>
            {order.notes && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">📝 Note</span>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 min-w-[170px]">
          {s === "pending" && (
            <button onClick={() => doUpdate("printing")} disabled={updating}
              className="flex items-center justify-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50">
              {updating ? <Spinner size="sm" color="border-blue-500" /> : "🖨️ Start Printing"}
            </button>
          )}
          {s === "printing" && (
            <button onClick={() => doUpdate("ready")} disabled={updating}
              className="flex items-center justify-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-purple-100 transition-all disabled:opacity-50">
              {updating ? <Spinner size="sm" color="border-purple-500" /> : "🔔 Printing Done — Notify"}
            </button>
          )}
          {s === "ready" && (
            <button onClick={() => doUpdate("completed")} disabled={updating}
              className="flex items-center justify-center gap-1.5 bg-green-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50">
              {updating ? <Spinner size="sm" color="border-white" /> : "✅ Collected & Paid"}
            </button>
          )}
          <Link to={`/admin/orders/${order._id}`} className="btn-ghost text-xs py-2 text-center">
            View Details →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [toast, setToast] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    const q = tab !== "all" ? `?status=${tab}` : "";
    API.get(`/admin/orders${q}`)
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [tab]);

  const onStatusChange = async (id, status) => {
    try {
      await API.put(`/admin/orders/${id}/status`, { status });
      const msgs = {
        printing: "🖨️ Printing started!",
        ready: "🔔 Order ready for collection!",
        completed: "✅ Collected & paid!",
      };
      setToast({ message: msgs[status] || `Status → ${status}`, type: "success" });
      fetchOrders();
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Update failed", type: "error" });
    }
  };

  const TABS = ["all", ...STATUSES];

  return (
    <div className="flex-1 overflow-auto p-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="page-title">Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
              }`}>
            {t === "all" ? "All" : `${statusEmoji[t] || ""} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-display font-bold text-gray-700 text-xl">No orders</p>
          <p className="text-gray-400 text-sm mt-1.5">Orders appear here once students place them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => <OrderRow key={o._id} order={o} onStatusChange={onStatusChange} />)}
        </div>
      )}
    </div>
  );
}