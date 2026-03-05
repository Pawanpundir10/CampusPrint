import { useState, useEffect } from "react";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import { fmt } from "../../utils/helpers";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`card p-5 border-l-4 ${accent}`}>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export default function Earnings() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    API.get("/admin/earnings").then(({data})=>setData(data)).finally(()=>setLoading(false));
  },[]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg"/></div>;
  if (!data)   return <div className="text-center py-32 text-gray-400">No data available</div>;

  const maxE = Math.max(...(data.monthly?.map(m=>m.earnings)||[1]));

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-7">
        <h1 className="page-title">Earnings</h1>
        <p className="text-gray-500 mt-1">{data.shop?.shopName} · {data.shop?.collegeName}</p>
      </div>

      {/* Shop status banner */}
      <div className={`card p-4 mb-6 flex items-center justify-between ${data.shop?.isOpen?"border-green-200 bg-green-50":"border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${data.shop?.isOpen?"bg-green-500 anim-pulse-dot":"bg-gray-400"}`}/>
          <span className="font-semibold text-gray-900">{data.shop?.isOpen?"Shop is Open":"Shop is Closed"}</span>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${data.shop?.isOpen?"bg-green-100 text-green-700":"bg-gray-200 text-gray-500"}`}>
          {data.shop?.isOpen?"Accepting Orders":"Not Accepting"}
        </span>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Earnings" value={fmt(data.totalEarnings)} accent="border-orange-400"/>
        <StatCard label="This Month"     value={fmt(data.monthEarnings)}  accent="border-blue-400"/>
        <StatCard label="Today"          value={fmt(data.todayEarnings)}  accent="border-green-400"/>
        <StatCard label="Total Orders"   value={data.totalOrders}         accent="border-purple-400"/>
      </div>

      {/* Order breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { l:"Pending",   v:data.pendingOrders,   c:"bg-amber-50 text-amber-700"   },
          { l:"Completed", v:data.completedOrders, c:"bg-green-50 text-green-700"   },
          { l:"Cancelled", v:data.cancelledOrders, c:"bg-red-50 text-red-600"       },
        ].map(({l,v,c})=>(
          <div key={l} className={`card p-4 text-center ${c}`}>
            <p className="font-display text-3xl font-bold">{v}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-70">{l}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-gray-900 mb-5">Monthly Earnings (last 6 months)</h3>
        {!data.monthly?.length ? (
          <p className="text-gray-400 text-sm text-center py-8">No earnings data yet</p>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {data.monthly.map((m,i)=>{
              const pct = maxE > 0 ? (m.earnings/maxE)*100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-400 font-medium">{fmt(m.earnings)}</span>
                  <div className="w-full relative flex-1 bg-gray-100 rounded-t-lg overflow-hidden flex items-end">
                    <div
                      className="w-full bg-orange-400 rounded-t-lg transition-all duration-700"
                      style={{height:`${Math.max(pct,4)}%`}}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{MONTHS[m._id.m]}</span>
                  <span className="text-xs text-gray-300">{m.count} orders</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
