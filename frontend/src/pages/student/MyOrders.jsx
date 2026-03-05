import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import { fmt, fmtDateTime, statusBadge, statusEmoji } from "../../utils/helpers";

const TABS = ["all","pending","printing","completed","cancelled"];

export default function MyOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

  useEffect(() => {
    API.get("/orders/my").then(({data})=>setOrders(data)).finally(()=>setLoading(false));
  }, []);

  const shown = tab==="all" ? orders : orders.filter(o=>o.orderStatus===tab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} order{orders.length!==1?"s":""} total</p>
        </div>
        <Link to="/student/new-order" className="btn-orange">+ New Order</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              tab===t ? "bg-gray-900 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
            }`}>
            {t==="all" ? "All" : `${statusEmoji[t]} ${t.charAt(0).toUpperCase()+t.slice(1)}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg"/></div>
      ) : shown.length===0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🖨️</p>
          <p className="font-display font-bold text-gray-700 text-xl">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1.5 mb-6">Place your first print order</p>
          <Link to="/student/new-order" className="btn-orange">Start Printing</Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map(o=>(
            <Link key={o._id} to={`/student/orders/${o._id}`}
              className="card p-5 flex items-center justify-between hover:shadow-md transition-all group block anim-fade-up">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-2xl flex-shrink-0">{statusEmoji[o.orderStatus]}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-gray-900 truncate">{o.shopId?.shopName}</span>
                    <span className={statusBadge(o.orderStatus)}>{o.orderStatus}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {o.files?.length} file{o.files?.length!==1?"s":""} · {fmtDateTime(o.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-display font-bold text-gray-900">{fmt(o.totalAmount)}</p>
                  <span className={statusBadge(o.paymentStatus)}>{o.paymentStatus}</span>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
