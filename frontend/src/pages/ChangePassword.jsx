import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/common/Toast";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const submit = async () => {
        if (!form.currentPassword) { setToast({ message: "Enter current password", type: "error" }); return; }
        if (form.newPassword.length < 6) { setToast({ message: "New password min 6 chars", type: "error" }); return; }
        if (form.newPassword !== form.confirm) { setToast({ message: "Passwords don't match", type: "error" }); return; }
        setLoading(true);
        try {
            const { data } = await API.post("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            setToast({ message: data.message, type: "success" });
            setForm({ currentPassword: "", newPassword: "", confirm: "" });
            setTimeout(() => navigate(-1), 1800);
        } catch (e) {
            setToast({ message: e.response?.data?.message || "Failed", type: "error" });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Change Password</h1>
                <p className="text-gray-400 text-sm mb-7">Update your account password.</p>

                {[
                    { key: "currentPassword", label: "Current Password", placeholder: "Your current password" },
                    { key: "newPassword", label: "New Password", placeholder: "Min 6 characters" },
                    { key: "confirm", label: "Confirm New Password", placeholder: "Re-enter new password" },
                ].map(f => (
                    <div key={f.key} className="mb-4">
                        <label className="label">{f.label}</label>
                        <input
                            type={show ? "text" : "password"}
                            value={form[f.key]}
                            onChange={e => upd(f.key, e.target.value)}
                            placeholder={f.placeholder}
                            className="input"
                        />
                    </div>
                ))}

                <label className="flex items-center gap-2 text-sm text-gray-500 mb-6 cursor-pointer select-none">
                    <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} className="rounded" />
                    Show passwords
                </label>

                <button onClick={submit} disabled={loading}
                    className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
                    {loading ? "Updating…" : "Update Password →"}
                </button>
            </div>
        </div>
    );
}