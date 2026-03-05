import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmt } from "../../utils/helpers";

const FileRow = ({ f, i, shop, onUpdate, onRemove }) => {
  const price = f.printType === "color" ? shop.colorPrice : shop.bwPrice;
  const amount = (f.pages || 0) * (f.copies || 1) * price;
  return (
    <div className="card p-4 border-l-4 border-l-orange-400">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 text-xs font-bold">PDF</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{f.fileName}</p>
            {f.uploading && <div className="text-xs text-blue-500 flex items-center gap-1 mt-1"><Spinner size="sm" color="border-blue-500" /> Uploading…</div>}
            {f.error && <p className="text-xs text-red-500 mt-1">{f.error}</p>}
            {f.fileUrl && !f.uploading && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-display font-bold text-orange-500">{fmt(amount)}</span>
          <button onClick={() => onRemove(i)} className="w-7 h-7 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors text-lg leading-none">×</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Pages</label>
          <input type="number" min={1} value={f.pages} onChange={e => onUpdate(i, "pages", parseInt(e.target.value) || 1)} className="input text-center" />
        </div>
        <div>
          <label className="label">Copies</label>
          <input type="number" min={1} value={f.copies} onChange={e => onUpdate(i, "copies", parseInt(e.target.value) || 1)} className="input text-center" />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={f.printType} onChange={e => onUpdate(i, "printType", e.target.value)} className="input">
            <option value="bw">B/W — {fmt(shop.bwPrice)}/pg</option>
            <option value="color">Color — {fmt(shop.colorPrice)}/pg</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default function NewOrder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fileRef = useRef();
  const shopIdP = params.get("shopId");

  const [allShops, setAllShops] = useState([]);
  const [selShop, setSelShop] = useState(shopIdP || "");
  const [shop, setShop] = useState(null);
  const [loadShop, setLoadShop] = useState(false);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { API.get("/shops").then(({ data }) => setAllShops(data)); }, []);

  useEffect(() => {
    if (!selShop) { setShop(null); return; }
    setLoadShop(true);
    API.get(`/shops/${selShop}`).then(({ data }) => setShop(data)).finally(() => setLoadShop(false));
  }, [selShop]);

  const addFiles = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    const entries = selected.map((f, idx) => ({
      file: f,
      fileName: f.name,
      fileUrl: "",
      publicId: "",
      pages: 1,
      copies: 1,
      printType: "bw",
      uploading: true,
      error: null
    }));
    setFiles(p => [...p, ...entries]);
    const fd = new FormData();
    selected.forEach(f => fd.append("pdfs", f));
    try {
      // NOTE: let axios set the Content-Type header including boundary
      const { data } = await API.post("/orders/upload-files", fd);
      setFiles(p => {
        const up = [...p];
        data.files.forEach((u, i) => {
          const idx = up.findIndex(f => f.fileName === selected[i].name && f.uploading);
          if (idx !== -1) up[idx] = { ...up[idx], fileUrl: u.fileUrl, publicId: u.publicId, uploading: false };
        });
        return up;
      });
    } catch (err) {
      console.error("Upload error:", err.response || err);
      setFiles(p => p.map(f => f.uploading ? { ...f, uploading: false, error: "Upload failed" } : f));
      setToast({ message: "Upload failed — please try again or contact support", type: "error" });
    }
    fileRef.current.value = "";
  };

  const upd = (i, k, v) => setFiles(p => p.map((f, j) => j === i ? { ...f, [k]: v } : f));
  const rem = (i) => setFiles(p => p.filter((_, j) => j !== i));

  const total = files.reduce((s, f) => {
    if (!shop) return s;
    return s + (f.pages || 0) * (f.copies || 1) * (f.printType === "color" ? shop.colorPrice : shop.bwPrice);
  }, 0);

  const submit = async () => {
    if (!selShop) { setToast({ message: "Select a shop", type: "error" }); return; }
    if (files.length === 0) { setToast({ message: "Add at least one PDF", type: "error" }); return; }
    if (files.some(f => f.uploading)) { setToast({ message: "Wait for uploads to finish", type: "warning" }); return; }
    if (files.some(f => !f.fileUrl)) { setToast({ message: "Some files failed to upload", type: "error" }); return; }
    setSubmitting(true);
    try {
      const payload = {
        shopId: selShop,
        files: files.map(({ fileName, fileUrl, publicId, pages, copies, printType }) => ({
          fileName,
          fileUrl,
          publicId,
          pages,
          copies,
          printType,
        })),
        // backend currently supports only cash-at-shop
        paymentMethod: "cash",
        notes,
      };
      const { data: order } = await API.post("/orders", payload);
      setToast({ message: "Order placed! Pay at the shop.", type: "success" });
      setTimeout(() => navigate(`/student/orders/${order._id}`), 1600);
    } catch (e) { setToast({ message: e.response?.data?.message || "Order failed", type: "error" }); }
    finally { setSubmitting(false); }
  };



  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-7">
        <h1 className="page-title">New Print Order</h1>
        <p className="text-gray-500 mt-1">Upload PDFs and configure your print settings</p>
      </div>

      {/* 1. Shop */}
      <div className="card p-5 mb-4">
        <h2 className="font-display font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
          Select Shop
        </h2>
        <select value={selShop} onChange={e => setSelShop(e.target.value)} className="input">
          <option value="">Choose a print shop…</option>
          {allShops.map(s => <option key={s._id} value={s._id} disabled={!s.isOpen}>{s.shopName} — {s.collegeName}{!s.isOpen ? " (Closed)" : ""}</option>)}
        </select>
        {loadShop && <div className="flex justify-center mt-4"><Spinner /></div>}
        {shop && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xs text-gray-400">B&W per page</p>
              <p className="font-display font-bold text-gray-900">{fmt(shop.bwPrice)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
              <p className="text-xs text-gray-400">Color per page</p>
              <p className="font-display font-bold text-orange-600">{fmt(shop.colorPrice)}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Files */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
            Upload PDFs
          </h2>
          {shop && <button onClick={() => fileRef.current.click()} className="btn-ghost text-xs py-1.5 px-3">+ Add Files</button>}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" multiple onChange={addFiles} className="hidden" />
        {!shop ? (
          <p className="text-gray-400 text-sm text-center py-8">Select a shop first</p>
        ) : files.length === 0 ? (
          <div onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <p className="text-gray-600 font-medium">Drop PDFs or click to upload</p>
            <p className="text-gray-400 text-xs mt-1">Up to 10 files · 20MB each</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((f, i) => <FileRow key={i} f={f} i={i} shop={shop} onUpdate={upd} onRemove={rem} />)}
          </div>
        )}
      </div>

      {/* 3. Payment */}
      {files.length > 0 && shop && (
        <div className="card p-5 mb-4">
          <h2 className="font-display font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
            Payment Method
          </h2>
          <div className="card p-4 bg-green-50 border-green-200 mb-4">
            <p className="text-green-800 font-semibold text-sm">💵 Pay at Shop</p>
            <p className="text-green-600 text-xs mt-0.5">Pay cash when you collect your prints</p>
          </div>
          <div>
            <label className="label">
              Notes for Shop{" "}
              <span className="text-gray-400 normal-case font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Please staple all pages"
              className="input resize-none"
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {files.length > 0 && shop && (
        <div className="card p-5 bg-gray-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {files.length} file{files.length !== 1 ? "s" : ""} · Pay at shop
              </p>
              <p className="font-display text-3xl font-bold mt-0.5">
                {fmt(total)}
              </p>
            </div>
            <button onClick={submit} disabled={submitting || files.some(f => f.uploading)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Placing…" : "Place Order →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
