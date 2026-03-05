import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import Toast from "../../components/common/Toast";
import Spinner from "../../components/common/Spinner";
import { COLLEGES } from "../../utils/helpers";

const VerificationBadge = ({ status, note }) => {
  const config = {
    pending: { bg: "bg-amber-50 border-amber-200", icon: "⏳", color: "text-amber-700", title: "Verification Pending", desc: "Your shop is under review. We'll email you once it's approved (usually within 24h)." },
    approved: { bg: "bg-green-50 border-green-200", icon: "✅", color: "text-green-700", title: "Shop Verified & Live", desc: "Your shop is verified and visible to students." },
    rejected: { bg: "bg-red-50 border-red-200", icon: "❌", color: "text-red-700", title: "Verification Rejected", desc: note || "Your shop did not meet requirements. Update details and save to resubmit." },
  };
  const c = config[status];
  return (
    <div className={`rounded-2xl border p-4 mb-5 flex items-start gap-3 ${c.bg}`}>
      <span className="text-2xl flex-shrink-0">{c.icon}</span>
      <div>
        <p className={`font-semibold text-sm ${c.color}`}>{c.title}</p>
        <p className={`text-sm mt-0.5 ${c.color} opacity-80`}>{c.desc}</p>
      </div>
    </div>
  );
};

export default function ShopSetup() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    shopName: "", collegeName: "", location: "", description: "", phone: "",
    bwPrice: 1, colorPrice: 5, isOpen: false,
  });

  useEffect(() => {
    API.get("/shops/my")
      .then(({ data }) => {
        setShop(data);
        setForm({
          shopName: data.shopName || "",
          collegeName: data.collegeName || "",
          location: data.location || "",
          description: data.description || "",
          phone: data.phone || "",
          bwPrice: data.bwPrice || 1,
          colorPrice: data.colorPrice || 5,
          isOpen: data.isOpen || false,
        });
      })
      .catch(() => { }) // no shop yet
      .finally(() => setLoading(false));
  }, []);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.shopName || !form.collegeName) {
      setToast({ message: "Shop name and college are required", type: "error" }); return;
    }
    setSaving(true);
    try {
      if (shop) {
        const { data } = await API.put(`/shops/${shop._id}`, form);
        setShop(data.shop);
        setToast({ message: data.message, type: "success" });
      } else {
        const { data } = await API.post("/shops", form);
        setShop(data.shop);
        updateUser({ shopId: data.shop._id });
        setToast({ message: data.message, type: "success" });
      }
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Save failed", type: "error" });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="flex-1 overflow-auto p-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="page-title">{shop ? "My Shop" : "Set Up Your Shop"}</h1>
          <p className="text-gray-400 mt-1">
            {shop ? "Manage your shop details" : "Create your shop profile to start receiving orders"}
          </p>
        </div>

        {/* Verification status banner */}
        {shop && <VerificationBadge status={shop.verificationStatus} note={shop.verificationNote} />}

        {/* isOpen toggle — only if approved */}
        {shop?.verificationStatus === "approved" && (
          <div className="card p-5 mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Shop Status</p>
              <p className="text-sm text-gray-400 mt-0.5">{form.isOpen ? "Open — accepting orders" : "Closed — not accepting orders"}</p>
            </div>
            <button
              onClick={() => { upd("isOpen", !form.isOpen); setSaving(true); API.put(`/shops/${shop._id}`, { ...form, isOpen: !form.isOpen }).then(() => setSaving(false)); }}
              className={`relative w-14 h-7 rounded-full transition-colors ${form.isOpen ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.isOpen ? "translate-x-7" : ""}`} />
            </button>
          </div>
        )}

        {/* Shop details form */}
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Shop Name *</label>
              <input value={form.shopName} onChange={e => upd("shopName", e.target.value)} placeholder="e.g. QuickPrint" className="input" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">College *</label>
              <select value={form.collegeName} onChange={e => upd("collegeName", e.target.value)} className="input">
                <option value="">Select college…</option>
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="+91 9876543210" className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Location / Address</label>
              <input value={form.location} onChange={e => upd("location", e.target.value)} placeholder="e.g. Near Main Gate, Block A" className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Description <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
              <textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={2} placeholder="Tell students about your shop…" className="input resize-none" />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">B/W Price (₹ per page) *</label>
              <input type="number" min={0.5} step={0.5} value={form.bwPrice} onChange={e => upd("bwPrice", parseFloat(e.target.value))} className="input text-center" />
            </div>
            <div>
              <label className="label">Color Price (₹ per page) *</label>
              <input type="number" min={1} step={0.5} value={form.colorPrice} onChange={e => upd("colorPrice", parseFloat(e.target.value))} className="input text-center" />
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-60 mt-2">
            {saving ? <Spinner size="sm" color="border-white" /> : shop ? "Save Changes →" : "Create Shop & Request Verification →"}
          </button>

          {!shop && (
            <p className="text-xs text-gray-400 text-center">
              After creating, a verification request will be sent to our team. You'll receive an email once approved.
            </p>
          )}
        </div>

        {/* Change password link */}
        <div className="mt-5 text-center">
          <button onClick={() => navigate("/change-password")} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            🔒 Change Password
          </button>
        </div>
      </div>
    </div>
  );
}