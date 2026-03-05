export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const statusBadge = (s) =>
  ({
    pending: "badge-pending",
    printing: "badge-printing",
    ready:
      "badge badge-printing bg-purple-50 text-purple-700 border-purple-200",
    completed: "badge-completed",
    cancelled: "badge-cancelled",
    paid: "badge-paid",
    refunded: "badge-refunded",
  })[s] || "badge-pending";

export const statusEmoji = {
  pending: "⏳",
  printing: "🖨️",
  ready: "🔔",
  completed: "✅",
  cancelled: "❌",
};

export const COLLEGES = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "Delhi University",
  "Mumbai University",
  "Pune University",
  "Anna University",
  "VIT Vellore",
  "Manipal University",
  "SRM University",
  "Chandigarh University",
  "Amity University",
  "Lovely Professional University",
  "BITS Pilani",
  "IIIT Hyderabad",
];
