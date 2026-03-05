import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (!email) { setError("Enter your email"); return; }
        setLoading(true); setError("");
        try {
            await API.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (e) {
            setError(e.response?.data?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">

                {/* Logo */}
                <div className="mb-8">
                    <span className="font-display text-2xl font-black">Campus<span className="text-orange-500">Print</span></span>
                </div>

                {sent ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📬</span>
                        </div>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
                        </p>
                        <Link to="/login" className="btn-ghost w-full block text-center py-3">← Back to Login</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
                        <p className="text-gray-400 text-sm mb-7">Enter your email and we'll send you a reset link.</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="label">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && submit()}
                                placeholder="you@example.com"
                                className="input"
                            />
                        </div>

                        <button onClick={submit} disabled={loading}
                            className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
                            {loading ? "Sending…" : "Send Reset Link →"}
                        </button>

                        <div className="text-center mt-5">
                            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}