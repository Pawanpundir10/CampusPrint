import { useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Toast from "../components/common/Toast";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const justVerified = params.get("verified") === "true";

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(
    justVerified
      ? { message: "✅ Email verified! You can now log in.", type: "success" }
      : null,
  );

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Use AuthContext login, which talks to the API and stores token/user
      const user = await login(form.email, form.password);
      navigate(
        user.role === "superAdmin"
          ? "/superadmin"
          : user.role === "admin"
            ? "/admin/orders"
            : "/student/shops",
      );
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gray-950 text-white p-12">
        <Link to="/" className="font-display text-2xl font-black">
          Campus<span className="text-orange-500">Print</span>
        </Link>
        <div>
          <p className="text-4xl font-display font-bold leading-tight mb-4">
            Smart printing<br />for campus life
          </p>
          <p className="text-gray-400">Upload PDFs, configure settings, track your order — all without the queue.</p>
        </div>
        <p className="text-gray-600 text-sm">© 2025 CampusPrint</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          <div className="lg:hidden mb-8">
            <span className="font-display text-2xl font-black">Campus<span className="text-orange-500">Print</span></span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <div>{error}</div>
              {error.includes("Email not verified") && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <Link to="/resend-verification" className="text-red-600 hover:text-red-700 font-medium underline">
                    Click here to resend verification email →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => upd("email", e.target.value)}
              placeholder="you@example.com" className="input" />
          </div>

          <div className="mb-2">
            <label className="label">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={form.password}
                onChange={e => upd("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Your password" className="input pr-12" />
              <button type="button" onClick={() => setShow(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium">
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end mb-6">
            <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <button onClick={submit} disabled={loading}
            className="btn-primary w-full py-3.5 text-base mb-4 disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600">Sign up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}