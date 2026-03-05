import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmt, fmtDateTime, statusBadge } from "../../utils/helpers";

const STATUS_FLOW = [
  { key: "pending", label: "Received", icon: "⏳", desc: "Order placed" },
  { key: "printing", label: "Printing", icon: "🖨️", desc: "Currently printing" },
  { key: "ready", label: "Ready", icon: "🔔", desc: "Collect from shop" },
  { key: "completed", label: "Collected", icon: "✅", desc: "Collected & paid" },
];

const NEXT_ACTIONS = {
  pending: { status: "printing", label: "🖨️ Start Printing", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
  printing: { status: "ready", label: "🔔 Printing Done — Notify Student", color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100" },
  ready: { status: "completed", label: "✅ Student Collected & Paid", color: "bg-green-600 text-white hover:bg-green-700" },
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = () =>
    API.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await API.put(`/admin/orders/${id}/status`, { status });
      const msgs = {
        printing: "🖨️ Printing started!",
        ready: "🔔 Student notified — order ready for collection!",
        completed: "✅ Order collected & payment received!",
      };
      setToast({ message: msgs[status], type: "success" });
      reload();
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Failed", type: "error" });
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-32 text-gray-400">Order not found</div>;

  const currentStep = STATUS_FLOW.findIndex(s => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const isCompleted = order.orderStatus === "completed";
  const nextAction = NEXT_ACTIONS[order.orderStatus];

  return (
    <div className="flex-1 overflow-auto p-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-400 text-xs">{fmtDateTime(order.createdAt)}</p>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <span className={statusBadge(order.orderStatus) + " text-sm px-3 py-1.5"}>
              {order.orderStatus}
            </span>
            <span className={statusBadge(order.paymentStatus) + " text-sm px-3 py-1.5"}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* 4-step progress bar */}
        {!isCancelled && (
          <div className="card p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Progress</p>
            <div className="flex items-start">
              {STATUS_FLOW.map((s, i) => (
                <div key={s.key} className={`flex items-center ${i < STATUS_FLOW.length - 1 ? "flex-1" : ""}`}>
                  <div className="flex flex-col items-center text-center w-16">
                    {/* Circle */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 transition-all ${i < currentStep ? "border-orange-400 bg-orange-400 text-white" :
                      i === currentStep ? "border-orange-400 bg-orange-50" :
                        "border-gray-200 bg-white opacity-40"
                      }`}>
                      {i < currentStep ? "✓" : s.icon}
                    </div>
                    <span className={`text-xs mt-1.5 font-semibold leading-tight ${i <= currentStep ? "text-gray-800" : "text-gray-300"
                      }`}>
                      {s.label}
                    </span>
                    <span className={`text-xs mt-0.5 leading-tight ${i <= currentStep ? "text-gray-400" : "text-gray-200"
                      }`}>
                      {s.desc}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-8 ${i < currentStep ? "bg-orange-400" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed celebration banner */}
        {isCompleted && (
          <div className="card p-4 mb-4 bg-green-50 border-green-200 flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800">All done!</p>
              <p className="text-green-600 text-sm mt-0.5">
                Student collected prints · {fmt(order.totalAmount)} received
              </p>
            </div>
          </div>
        )}

        {/* Student */}
        <div className="card p-5 mb-4">
          <h3 className="font-display font-semibold text-gray-900 mb-3">Student</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
              {order.studentId?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{order.studentId?.name}</p>
              <p className="text-sm text-gray-400">{order.studentId?.email}</p>
              {order.studentId?.phone && <p className="text-sm text-gray-400">📞 {order.studentId.phone}</p>}
            </div>
          </div>
        </div>

        {/* Files */}
        <div className="card p-5 mb-4">
          <h3 className="font-display font-semibold text-gray-900 mb-1">Files ({order.files?.length})</h3>
          <p className="text-xs text-gray-400 mb-4">Click Open PDF to view each file for printing</p>
          <div className="divide-y divide-gray-50">
            {order.files?.map((f, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">PDF</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{f.fileName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f.pages} pages</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f.copies} {f.copies !== 1 ? "copies" : "copy"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.printType === "color" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                          {f.printType === "bw" ? "⬛ B/W" : "🎨 Color"}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">{fmt(f.amount)}</span>
                      </div>
                    </div>
                  </div>
                  <a href={(() => {
                    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    const token = localStorage.getItem("cp_token") || "";
                    if (f.fileUrl.startsWith("http")) return f.fileUrl; // legacy full URL
                    return `${base}${f.fileUrl}?token=${encodeURIComponent(token)}`;
                  })()} target="_blank" rel="noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">Total</span>
            <span className="font-display font-bold text-xl text-orange-500">{fmt(order.totalAmount)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="card p-4 mb-4 bg-amber-50 border-amber-100">
            <p className="text-sm text-amber-800">📝 <span className="font-medium">{order.notes}</span></p>
          </div>
        )}

        {/* Next action button */}
        {nextAction && !isCancelled && (
          <div className="card p-5 mb-4">
            <h3 className="font-display font-semibold text-gray-900 mb-1">Next Step</h3>
            <p className="text-xs text-gray-400 mb-4">
              {order.orderStatus === "pending" && "Start printing the student's files"}
              {order.orderStatus === "printing" && "Mark printing as done — student will see 'Ready for collection'"}
              {order.orderStatus === "ready" && "Student has collected their prints and paid cash"}
            </p>
            <button
              onClick={() => updateStatus(nextAction.status)}
              disabled={updating}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold border-2 transition-all disabled:opacity-50 ${nextAction.color}`}
            >
              {updating ? <Spinner size="sm" color={order.orderStatus === "ready" ? "border-white" : "border-current"} /> : nextAction.label}
            </button>
          </div>
        )}

        {/* Cancelled */}
        {isCancelled && (
          <div className="card p-4 bg-red-50 border-red-100">
            <p className="text-sm text-red-700">❌ Cancelled: {order.cancellationReason}</p>
          </div>
        )}

      </div>
    </div>
  );
}