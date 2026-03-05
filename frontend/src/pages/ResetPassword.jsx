import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const submit = async () => {
        if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
        if (password !== confirm) { setError("Passwords don't match"); return; }
        setLoading(true); setError("");
        try {
            await API.post("/auth/reset-password", { token, password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (e) {
            setError(e.response?.data?.message || "Reset failed. Link may have expired.");
        } finally { setLoading(false); }
    };

    if (!token) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 font-semibold">Invalid reset link.</p>
                <Link to="/forgot-password" className="text-orange-500 text-sm mt-2 block">Request a new one →</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">

                <div className="mb-8">
                    <span className="font-display text-2xl font-black">Campus<span className="text-orange-500">Print</span></span>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                        <p className="text-gray-500 text-sm">Redirecting you to login…</p>
                    </div>
                ) : (
                    <>
                        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
                        <p className="text-gray-400 text-sm mb-7">Choose a strong password for your account.</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="label">New Password</label>
                            <div className="relative">
                                <input
                                    type={show ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="input pr-12"
                                />
                                <button type="button" onClick={() => setShow(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium">
                                    {show ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="label">Confirm Password</label>
                            <input
                                type={show ? "text" : "password"}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && submit()}
                                placeholder="Re-enter password"
                                className="input"
                            />
                        </div>

                        <button onClick={submit} disabled={loading}
                            className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
                            {loading ? "Resetting…" : "Reset Password →"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}