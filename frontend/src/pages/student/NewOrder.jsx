import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { fmt } from "../../utils/helpers";

/* ─── Individual file row ─────────────────────────────────────────── */
const FileRow = ({ f, i, shop, onUpdate, onRemove, animDelay }) => {
  const price = f.printType === "color" ? shop.colorPrice : shop.bwPrice;
  const amount = (f.pages || 0) * (f.copies || 1) * price;

  return (
    <div
      className="file-row-card"
      style={{ animationDelay: `${animDelay * 60}ms` }}
    >
      {/* Top row: icon + name + price + remove */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="pdf-icon">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-orange-500" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px] leading-tight">
              {f.fileName}
            </p>
            {f.uploading && (
              <div className="flex items-center gap-1.5 mt-1">
                <Spinner size="sm" color="border-orange-400" />
                <span className="text-xs text-orange-500 font-medium">Uploading…</span>
              </div>
            )}
            {f.error && <p className="text-xs text-red-500 mt-1">{f.error}</p>}
            {f.fileUrl && !f.uploading && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-emerald-600 font-medium">
                  ✓ Uploaded
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{f.pages} {f.pages === 1 ? "page" : "pages"} detected</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className="font-bold text-orange-500 text-base tabular-nums">{fmt(amount)}</span>
          <button
            onClick={() => onRemove(i)}
            className="remove-btn"
            title="Remove file"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="ctrl-label">Pages</label>
          <input
            type="number"
            min={1}
            value={f.pages}
            onChange={e => onUpdate(i, "pages", parseInt(e.target.value) || 1)}
            className="ctrl-input"
          />
        </div>
        <div>
          <label className="ctrl-label">Copies</label>
          <input
            type="number"
            min={1}
            value={f.copies}
            onChange={e => onUpdate(i, "copies", parseInt(e.target.value) || 1)}
            className="ctrl-input"
          />
        </div>
        <div>
          <label className="ctrl-label">Type</label>
          <select
            value={f.printType}
            onChange={e => onUpdate(i, "printType", e.target.value)}
            className="ctrl-input"
          >
            <option value="bw">B/W</option>
            <option value="color">Color</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/* ─── Step badge ─────────────────────────────────────────────────── */
const Step = ({ n, label }) => (
  <h2 className="step-heading">
    <span className="step-num">{n}</span>
    {label}
  </h2>
);

/* ─── Main page ──────────────────────────────────────────────────── */
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
  const [dragging, setDragging] = useState(false);

  useEffect(() => { API.get("/shops").then(({ data }) => setAllShops(data)); }, []);

  useEffect(() => {
    if (!selShop) { setShop(null); return; }
    setLoadShop(true);
    API.get(`/shops/${selShop}`).then(({ data }) => setShop(data)).finally(() => setLoadShop(false));
  }, [selShop]);

  const processFiles = async (selected) => {
    if (!selected.length) return;
    const entries = selected.map(f => ({
      file: f,
      fileName: f.name,
      fileUrl: "",
      publicId: "",
      pages: 1,
      copies: 1,
      printType: "bw",
      uploading: true,
      error: null,
    }));
    setFiles(p => [...p, ...entries]);

    const fd = new FormData();
    selected.forEach(f => fd.append("pdfs", f));
    try {
      const { data } = await API.post("/orders/upload-files", fd);
      setFiles(p => {
        const up = [...p];
        data.files.forEach((u, i) => {
          const idx = up.findIndex(f => f.fileName === selected[i].name && f.uploading);
          if (idx !== -1) {
            up[idx] = {
              ...up[idx],
              fileUrl: u.fileUrl,
              publicId: u.publicId || "",
              pages: u.pageCount || 1,
              uploading: false,
            };
          }
        });
        return up;
      });
    } catch (err) {
      console.error("Upload error:", err.response || err);
      setFiles(p => p.map(f => f.uploading ? { ...f, uploading: false, error: "Upload failed" } : f));
      setToast({ message: "Upload failed — please try again", type: "error" });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const addFiles = async (e) => {
    const selected = Array.from(e.target.files);
    await processFiles(selected);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const selected = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (!selected.length) {
      setToast({ message: "Only PDF files are accepted", type: "error" });
      return;
    }
    await processFiles(selected);
  };

  const upd = (i, k, v) => setFiles(p => p.map((f, j) => j === i ? { ...f, [k]: v } : f));
  const rem = (i) => setFiles(p => p.filter((_, j) => j !== i));

  const total = files.reduce((s, f) => {
    if (!shop) return s;
    return s + (f.pages || 0) * (f.copies || 1) * (f.printType === "color" ? shop.colorPrice : shop.bwPrice);
  }, 0);

  const anyUploading = files.some(f => f.uploading);

  const submit = async () => {
    if (!selShop) { setToast({ message: "Select a shop first", type: "error" }); return; }
    if (files.length === 0) { setToast({ message: "Add at least one PDF", type: "error" }); return; }
    if (anyUploading) { setToast({ message: "Wait for uploads to finish", type: "warning" }); return; }
    if (files.some(f => !f.fileUrl)) { setToast({ message: "Some files failed to upload", type: "error" }); return; }
    setSubmitting(true);
    try {
      const payload = {
        shopId: selShop,
        files: files.map(({ fileName, fileUrl, publicId, pages, copies, printType }) => ({
          fileName, fileUrl, publicId, pages, copies, printType,
        })),
        paymentMethod: "cash",
        notes,
      };
      const { data: order } = await API.post("/orders", payload);
      setToast({ message: "Order placed! Pay at the shop.", type: "success" });
      setTimeout(() => navigate(`/student/orders/${order._id}`), 1600);
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Order failed", type: "error" });
    } finally { setSubmitting(false); }
  };

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .new-order-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 2rem 1rem 6rem;
        }

        /* Section cards */
        .section-card {
          background: #fff;
          border: 1px solid #f0f0ef;
          border-radius: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04);
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: box-shadow .2s;
        }
        .section-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.06); }

        /* Step heading */
        .step-heading {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          font-size: 1rem;
          color: #111;
          margin-bottom: 0.9rem;
        }
        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(249,115,22,.35);
        }

        /* File row */
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .file-row-card {
          background: linear-gradient(135deg, #fff9f5 0%, #fff 100%);
          border: 1px solid #ffe8d4;
          border-radius: 16px;
          padding: 1rem;
          animation: slideIn .3s ease both;
          transition: box-shadow .2s;
        }
        .file-row-card:hover { box-shadow: 0 4px 16px rgba(249,115,22,.1); }

        .pdf-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          border: 1px solid #fed7aa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .remove-btn {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background .15s, color .15s, transform .15s;
        }
        .remove-btn:hover { background: #fee2e2; color: #ef4444; transform: scale(1.1); }

        /* File controls */
        .ctrl-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #9ca3af;
          margin-bottom: 0.3rem;
        }
        .ctrl-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.5rem 0.65rem;
          font-size: 0.82rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #111;
          outline: none;
          text-align: center;
          transition: border-color .15s, box-shadow .15s;
          appearance: none;
          -webkit-appearance: none;
        }
        .ctrl-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,.12);
        }

        /* Drop zone */
        @keyframes bobble {
          0%,100% { transform: translateY(0); }
          50%  { transform: translateY(-5px); }
        }
        .drop-zone {
          border: 2px dashed #e5e7eb;
          border-radius: 18px;
          padding: 2.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: border-color .2s, background .2s;
          text-align: center;
        }
        .drop-zone:hover, .drop-zone.drag-over {
          border-color: #f97316;
          background: rgba(249,115,22,.04);
        }
        .drop-zone.drag-over .drop-icon { animation: bobble .6s ease infinite; }
        .drop-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          border: 1px solid #fed7aa;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
          transition: background .2s;
        }

        /* Select */
        .fancy-select {
          width: 100%;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #111;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 16px;
          padding-right: 2.5rem;
          cursor: pointer;
          transition: border-color .15s, box-shadow .15s;
        }
        .fancy-select:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,.12);
        }

        /* Price chips */
        .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 0.75rem; }
        .price-chip {
          border-radius: 14px;
          padding: 0.75rem;
          text-align: center;
          border: 1px solid;
        }
        .price-chip-bw  { background: #f9fafb; border-color: #e5e7eb; }
        .price-chip-col { background: #fff7ed; border-color: #fed7aa; }
        .price-chip-label { font-size: 0.65rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 0.2rem; }
        .price-chip-value { font-size: 1.05rem; font-weight: 800; }

        /* Notes textarea */
        .notes-area {
          width: 100%;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #111;
          outline: none;
          resize: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .notes-area:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,.12);
        }

        /* Summary bar */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .summary-bar {
          background: linear-gradient(135deg, #1a1a1a 0%, #111 100%);
          border-radius: 20px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          animation: slideUp .35s ease both;
          box-shadow: 0 8px 32px rgba(0,0,0,.18);
        }
        .place-btn {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          border-radius: 14px;
          padding: 0.85rem 1.5rem;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          box-shadow: 0 4px 14px rgba(249,115,22,.4);
        }
        .place-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(249,115,22,.5); }
        .place-btn:active:not(:disabled) { transform: translateY(0); }
        .place-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Upload progress dots */
        @keyframes dot-bounce {
          0%,80%,100% { transform: scale(0.6); opacity:.5; }
          40%          { transform: scale(1); opacity:1; }
        }
        .dot { display: inline-block; width:5px; height:5px; border-radius:50%; background:currentColor; margin:0 1.5px; animation: dot-bounce 1.2s ease infinite; }
        .dot:nth-child(2){ animation-delay:.2s; }
        .dot:nth-child(3){ animation-delay:.4s; }

        /* Page title */
        .page-hero { margin-bottom: 1.75rem; }
        .page-hero h1 {
          font-size: clamp(1.6rem, 4vw, 2rem);
          font-weight: 800;
          color: #0f0f0f;
          line-height: 1.15;
          letter-spacing: -.02em;
        }
        .page-hero p { color: #6b7280; font-size: 0.9rem; margin-top: 0.3rem; font-weight: 400; }

        /* Add more button */
        .add-more-btn {
          font-size: 0.77rem;
          font-weight: 600;
          color: #f97316;
          border: 1.5px solid #fed7aa;
          background: #fff7ed;
          border-radius: 8px;
          padding: 0.3rem 0.75rem;
          cursor: pointer;
          transition: background .15s, transform .15s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .add-more-btn:hover { background: #ffedd5; transform: translateY(-1px); }
      `}</style>

      <div className="new-order-page">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* Hero */}
        <div className="page-hero">
          <h1>New Print Order</h1>
          <p>Upload PDFs and configure your print settings</p>
        </div>

        {/* ① Shop select */}
        <div className="section-card">
          <Step n="1" label="Select Print Shop" />
          <select
            value={selShop}
            onChange={e => setSelShop(e.target.value)}
            className="fancy-select"
          >
            <option value="">Choose a print shop…</option>
            {allShops.map(s => (
              <option key={s._id} value={s._id} disabled={!s.isOpen}>
                {s.shopName} — {s.collegeName}{!s.isOpen ? " (Closed)" : ""}
              </option>
            ))}
          </select>

          {loadShop && <div className="flex justify-center mt-4"><Spinner /></div>}

          {shop && (
            <div className="price-grid">
              <div className="price-chip price-chip-bw">
                <div className="price-chip-label">B&amp;W / page</div>
                <div className="price-chip-value" style={{ color: "#374151" }}>{fmt(shop.bwPrice)}</div>
              </div>
              <div className="price-chip price-chip-col">
                <div className="price-chip-label">Color / page</div>
                <div className="price-chip-value" style={{ color: "#ea580c" }}>{fmt(shop.colorPrice)}</div>
              </div>
            </div>
          )}
        </div>

        {/* ② Upload */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-3">
            <Step n="2" label="Upload PDFs" />
            {shop && files.length > 0 && (
              <button className="add-more-btn" onClick={() => fileRef.current.click()}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Add more
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={addFiles}
            className="hidden"
          />

          {!shop ? (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>
              Select a shop first to enable uploads
            </p>
          ) : files.length === 0 ? (
            <div
              className={`drop-zone${dragging ? " drag-over" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={1.5} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p style={{ fontWeight: 600, color: "#374151", fontSize: "0.925rem" }}>
                Drop PDFs here or click to browse
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.78rem" }}>
                Up to 10 files · 20 MB each · Page count auto-detected
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {files.map((f, i) => (
                <FileRow key={i} f={f} i={i} shop={shop} onUpdate={upd} onRemove={rem} animDelay={i} />
              ))}
            </div>
          )}
        </div>

        {/* ③ Notes */}
        {files.length > 0 && shop && (
          <div className="section-card">
            <Step n="3" label="Notes for Shop" />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Please staple all pages, double-sided, etc."
              className="notes-area"
            />
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.4rem" }}>Optional — visible only to the shop</p>
          </div>
        )}

        {/* Summary & Place Order */}
        {files.length > 0 && shop && (
          <div className="summary-bar">
            <div>
              <p style={{ color: "#6b7280", fontSize: "0.78rem", fontWeight: 500 }}>
                {files.length} file{files.length !== 1 ? "s" : ""} · Pay at shop
              </p>
              <p style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.02em" }}>
                {fmt(total)}
              </p>
            </div>
            <button
              onClick={submit}
              disabled={submitting || anyUploading}
              className="place-btn"
            >
              {submitting ? (
                <>Placing<span className="dot" /><span className="dot" /><span className="dot" /></>
              ) : anyUploading ? (
                <>Uploading<span className="dot" /><span className="dot" /><span className="dot" /></>
              ) : (
                <>Place Order <span style={{ fontSize: "1rem" }}>→</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
