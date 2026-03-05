import { useState } from "react";
import API from "../services/api";
import Toast from "../components/common/Toast";
import { Link } from "react-router-dom";

export default function ResendVerification() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [toast, setToast] = useState(null);

    const handleResend = async () => {
        if (!email) {
            setToast({ message: "Please enter your email", type: "error" });
            return;
        }

        setLoading(true);
        try {
            // First try to get token from localStorage (if user was logged in)
            const token = localStorage.getItem("cp_token");

            if (!token) {
                // If not logged in, they need to do a manual verification by logging in first
                setToast({
                    message: "Please log in first, then we can resend the verification email.",
                    type: "info",
                });
                return;
            }

            const res = await API.post("/auth/resend-verification", {});
            setToast({
                message: "✅ Verification email sent! Check your inbox.",
                type: "success",
            });
            setEmail("");
        } catch (err) {
            setToast({
                message: err.response?.data?.message || "Failed to resend email",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📧</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Resend Verification
                </h1>
                <p className="text-gray-500 text-center mb-6">
                    Didn't receive your verification email? We'll send it again.
                </p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleResend}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition mb-4"
                >
                    {loading ? "Sending..." : "Resend Verification Email"}
                </button>

                <div className="text-center">
                    <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
