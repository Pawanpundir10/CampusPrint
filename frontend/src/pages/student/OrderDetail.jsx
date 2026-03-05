import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmt, fmtDateTime, statusBadge } from "../../utils/helpers";

const TL = [
  { key: "pending", label: "Placed", icon: "📋" },
  { key: "printing", label: "Printing", icon: "🖨️" },
  { key: "ready", label: "Ready! 🔔", icon: "🔔" },
  { key: "completed", label: "Collected", icon: "✅" },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [id]);

  const doCancel = async () => {
    setCancelling(true);
    try {
      await API.post(`/orders/${id}/cancel`, { reason });
      setToast({ message: "Order cancelled", type: "success" });
      setShowCancel(false);
      API.get(`/orders/${id}`).then(({ data }) => setOrder(data));
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Cancel failed", type: "error" });
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-32 text-gray-400">Order not found</div>;

  const step = TL.findIndex(t => t.key === order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const isReady = order.orderStatus === "ready";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-400 text-xs">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="ml-auto">
          <span className={statusBadge(order.orderStatus) + " text-sm px-3 py-1.5"}>{order.orderStatus}</span>
        </div>
      </div>

      {/* Ready to collect banner */}
      {isReady && (
        <div className="card p-4 mb-4 bg-purple-50 border-purple-200 flex items-center gap-3 animate-pulse">
          <span className="text-3xl">🔔</span>
          <div>
            <p className="font-bold text-purple-800">Your prints are ready!</p>
            <p className="text-purple-600 text-sm mt-0.5">
              Head to <strong>{order.shopId?.shopName}</strong> to collect and pay {fmt(order.totalAmount)}
            </p>
          </div>
        </div>
      )}

      {/* Progress timeline */}
      {!isCancelled && (
        <div className="card p-5 mb-4">
          <p className="font-semibold text-gray-900 mb-4">{order.shopId?.shopName} · {order.shopId?.collegeName}</p>
          <div className="flex items-center">
            {TL.map((t, i) => (
              <div key={t.key} className={`flex items-center ${i < TL.length - 1 ? "flex-1" : ""}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${i < step ? "border-orange-400 bg-orange-400 text-white" :
                      i === step ? "border-orange-400 bg-orange-50" :
                        "border-gray-200 bg-white opacity-40"
                    }`}>
                    {i < step ? "✓" : t.icon}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium text-center leading-tight max-w-[60px] ${i <= step ? "text-orange-500" : "text-gray-300"}`}>
                    {t.label}
                  </span>
                </div>
                {i < TL.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-6 ${i < step ? "bg-orange-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div className="card p-5 mb-4">
        <h3 className="font-display font-semibold text-gray-900 mb-3">Files ({order.files?.length})</h3>
        <div className="divide-y divide-gray-50">
          {order.files?.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">PDF</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{f.fileName}</p>
                  <p className="text-xs text-gray-400">{f.pages}pg · {f.copies} cop{f.copies !== 1 ? "ies" : "y"} · {f.printType === "bw" ? "B/W" : "Color"}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900 flex-shrink-0">{fmt(f.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="card p-5 mb-4">
        <h3 className="font-display font-semibold text-gray-900 mb-3">Payment</h3>
        <div className="divide-y divide-gray-50">
            {[
              ["Method", "💵 Pay at Shop"],
              [
                "Status",
                <span
                  key="ps"
                  className={statusBadge(order.paymentStatus)}
                >
                  {order.paymentStatus}
                </span>,
              ],
              [
                "Total",
                <span
                  key="amt"
                  className="font-display font-bold text-orange-500 text-xl"
                >
                  {fmt(order.totalAmount)}
                </span>,
              ],
              ["Placed", fmtDateTime(order.createdAt)],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-sm text-gray-400">{k}</span>
                <span className="text-sm font-medium text-gray-900">
                  {v}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Shop info */}
      {(order.shopId?.phone || order.shopId?.location) && (
        <div className="card p-4 mb-4">
          {order.shopId.phone && <p className="text-sm text-gray-500">📞 {order.shopId.phone}</p>}
          {order.shopId.location && <p className="text-sm text-gray-500 mt-1">📍 {order.shopId.location}</p>}
        </div>
      )}

      {order.notes && (
        <div className="card p-4 mb-4 bg-amber-50 border-amber-100">
          <p className="text-sm text-amber-800">📝 {order.notes}</p>
        </div>
      )}

      {/* Cancellation info */}
      {order.cancellationReason && (
        <div className="card p-4 mb-4 bg-red-50 border-red-100">
          <p className="text-sm text-red-700">❌ {order.cancellationReason}</p>
        </div>
      )}

      {/* Cancel button — only for pending orders */}
      {order.orderStatus === "pending" && !showCancel && (
        <button onClick={() => setShowCancel(true)} className="btn-danger w-full py-3 rounded-xl">
          Cancel Order
        </button>
      )}

      {showCancel && (
        <div className="card p-5 border-red-200">
          <p className="font-display font-semibold text-gray-900 mb-3">Cancel this order?</p>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="Reason (optional)" className="input mb-3 resize-none" />
          <div className="flex gap-3">
            <button onClick={() => setShowCancel(false)} className="btn-ghost flex-1">Keep Order</button>
            <button onClick={doCancel} disabled={cancelling}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
              {cancelling ? "Cancelling…" : "Yes, Cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}