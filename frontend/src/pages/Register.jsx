import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLLEGES } from "../utils/helpers";

export default function Register() {
  const { register } = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const [form, setForm] = useState({ name:"", email:"", password:"", role: params.get("role")||"student", collegeName:"", phone:"" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPassword = (pwd) =>
    pwd &&
    pwd.length >= 8 &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd);

  const submit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(form.email)) { setErr("Enter a valid email address."); return; }
    if (!strongPassword(form.password)) {
      setErr("Password must be 8+ chars with uppercase, lowercase, number, and symbol.");
      return;
    }
    setErr(""); setBusy(true);
    try {
      const data = await register(form);
      // After registration, ask user to verify email then sign in
      navigate("/login?verified=false", { state: { msg: data.message } });
    } catch (e) { setErr(e.response?.data?.message || "Registration failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17H17.01M3 7h11M3 11h11M3 15h7M19 9l-4 4-2-2"/>
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900 text-xl">Campus<span className="text-orange-500">Print</span></span>
          </Link>
        </div>

        <div className="card p-7">
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-5">Join CampusPrint today</p>

          {/* Role toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-5 gap-1">
            {[["student","🎓 Student"],["admin","🏪 Shop Owner"]].map(([r,l])=>(
              <button key={r} type="button" onClick={()=>set("role",r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${form.role===r?"bg-white shadow text-orange-600":"text-gray-500 hover:text-gray-700"}`}>
                {l}
              </button>
            ))}
          </div>

          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{err}</div>}

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label className="label">Full Name</label>
              <input value={form.name} onChange={e=>set("name",e.target.value)} required placeholder="Rahul Sharma" className="input"/>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} required placeholder="rahul@university.edu" className="input"/>
            </div>
            <div>
              <label className="label">Phone <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
              <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 98765 43210" className="input"/>
            </div>
            {form.role === "student" && (
              <div>
                <label className="label">College</label>
                <select value={form.collegeName} onChange={e=>set("collegeName",e.target.value)} className="input">
                  <option value="">Select college...</option>
                  {COLLEGES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e=>set("password",e.target.value)} required placeholder="Min. 6 characters" className="input"/>
            </div>
            <button type="submit" disabled={busy} className="btn-orange w-full py-3.5 rounded-xl text-base mt-1">
              {busy ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            Have an account? <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
