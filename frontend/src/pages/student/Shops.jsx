import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/common/Spinner";
import { fmt, COLLEGES } from "../../utils/helpers";

const ShopCard = ({ shop }) => (
  <div className="card-hover overflow-hidden">
    <div className={`h-1.5 ${shop.isOpen ? "bg-green-500" : "bg-gray-300"}`}/>
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg leading-tight">{shop.shopName}</h3>
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {shop.collegeName}{shop.location && ` · ${shop.location}`}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${shop.isOpen?"bg-green-50 text-green-700":"bg-gray-100 text-gray-400"}`}>
          {shop.isOpen ? "● Open" : "Closed"}
        </span>
      </div>

      {shop.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{shop.description}</p>}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">B&W</p>
          <p className="font-display font-bold text-gray-900 text-base">{fmt(shop.bwPrice)}<span className="text-xs text-gray-400 font-normal">/pg</span></p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
          <p className="text-xs text-gray-400 mb-0.5">Color</p>
          <p className="font-display font-bold text-orange-600 text-base">{fmt(shop.colorPrice)}<span className="text-xs text-gray-400 font-normal">/pg</span></p>
        </div>
      </div>

      {shop.phone && <p className="text-xs text-gray-400 mb-4">📞 {shop.phone}</p>}

      <Link to={`/student/new-order?shopId=${shop._id}`}
        className={`btn-orange w-full ${!shop.isOpen && "opacity-50 pointer-events-none"}`}>
        {shop.isOpen ? "Print Here →" : "Currently Closed"}
      </Link>
    </div>
  </div>
);

export default function Shops() {
  const { user } = useAuth();
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [college, setCollege] = useState(user?.collegeName || "");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    setLoading(true);
    API.get(`/shops${college ? `?college=${encodeURIComponent(college)}` : ""}`)
      .then(({ data }) => setShops(data))
      .finally(() => setLoading(false));
  }, [college]);

  const filtered = shops.filter(s =>
    s.shopName.toLowerCase().includes(search.toLowerCase()) ||
    s.collegeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h1 className="page-title">Print Shops</h1>
          <p className="text-gray-500 mt-1">Find a shop at your campus</p>
        </div>
        <Link to="/student/new-order" className="btn-orange shrink-0">+ New Order</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search shops…" className="input pl-10"/>
        </div>
        <select value={college} onChange={e=>setCollege(e.target.value)} className="input sm:w-56">
          <option value="">All Colleges</option>
          {COLLEGES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🏪</p>
          <p className="font-display font-bold text-gray-700 text-xl">No shops found</p>
          <p className="text-gray-400 text-sm mt-1.5">Try a different college or search term</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => <ShopCard key={s._id} shop={s}/>)}
        </div>
      )}
    </div>
  );
}
