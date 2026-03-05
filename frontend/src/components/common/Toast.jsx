import { useEffect } from "react";
const STYLES = {
  success: "bg-green-600 text-white",
  error:   "bg-red-600   text-white",
  info:    "bg-blue-600  text-white",
  warning: "bg-amber-500 text-white",
};
const ICONS = { success:"✓", error:"✕", info:"ℹ", warning:"⚠" };

const Toast = ({ message, type="success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium anim-fade-up ${STYLES[type]}`}>
      <span className="text-base font-bold">{ICONS[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};
export default Toast;
