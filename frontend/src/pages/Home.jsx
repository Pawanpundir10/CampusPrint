import { Link } from "react-router-dom";

const Feat = ({ icon, title, text, accent }) => (
  <div className="card p-6 hover:shadow-md transition-all group">
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${accent}`}>
      <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
    </div>
    <h3 className="font-display font-semibold text-gray-900 mb-1.5">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
  </div>
);

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950 text-white py-24 sm:py-32">
        {/* BG blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 left-1/3 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-xs font-medium px-4 py-2 rounded-full mb-8 text-white/70 anim-fade-up">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full anim-pulse-dot" />
            No more WhatsApp to the print shop
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 anim-fade-up delay-1">
            Smart printing<br />
            <span className="text-orange-400">for campus life.</span>
          </h1>

          <p className="text-white/60 text-xl max-w-xl mx-auto mb-10 anim-fade-up delay-2">
            Upload PDFs, choose settings, pay at the shop — pick up when ready. No queues. No chaos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 anim-fade-up delay-3">
            <Link to="/register" className="btn-orange px-8 py-3.5 text-base rounded-2xl">
              Get Started Free →
            </Link>
            <Link to="/login" className="border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-medium px-8 py-3.5 rounded-2xl text-base transition-all">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex items-center justify-center gap-12 anim-fade-up delay-4">
            {[["500+", "Colleges"], ["2 min", "Avg. order time"], ["₹0", "Hidden fees"]].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-2xl font-bold text-white">{n}</div>
                <div className="text-white/40 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo order preview */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        <div className="card overflow-hidden shadow-xl">
          <div className="bg-gray-900 px-5 py-3 flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded-full" /><div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" /><div className="w-2.5 h-2.5 bg-green-500 rounded-full" /></div>
            <span className="text-gray-500 text-xs ml-2">CampusPrint — New Order</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "thesis_final.pdf", pages: 42, copies: 2, type: "B/W", amt: "₹84" },
              { name: "project_slides.pdf", pages: 16, copies: 1, type: "Color", amt: "₹80" },
            ].map((f) => (
              <div key={f.name} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xs font-bold">PDF</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.pages}pg · {f.copies}x · {f.type}</p>
                  </div>
                </div>
                <span className="font-display font-bold text-orange-500">{f.amt}</span>
              </div>
            ))}
            <div className="sm:col-span-2 flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Total amount</p>
                <p className="font-display text-2xl font-bold text-gray-900">₹164</p>
              </div>
              <div className="flex gap-2">
                <span className="badge-completed">✓ Order Placed</span>
                <span className="badge-pending">Pay at Shop</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="page-title mb-3">Everything you need</h2>
          <p className="text-gray-500">Built for students and shop owners alike</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feat accent="bg-orange-500" icon="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            title="Bulk PDF Upload" text="Upload multiple PDFs in one order, each with its own print settings and page count." />
          <Feat accent="bg-blue-600" icon="5 13l4 4L19 7"
            title="Auto Page Count" text="Upload any PDF and we automatically detect the page count — no manual entry needed." />
          <Feat accent="bg-green-600" icon="9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            title="Live Order Tracking" text="Get real-time status updates as your order moves from pending → printing → ready." />
          <Feat accent="bg-purple-600" icon="17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            title="Campus-Based Search" text="Find shops at your college instantly. Filter by college name and compare prices." />
          <Feat accent="bg-red-500" icon="16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 2 2 2-2 2 2 2-2 4 2z"
            title="Easy Cancellation" text="Cancel pending orders instantly from the app before the shop starts printing." />
          <Feat accent="bg-amber-600" icon="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            title="Shop Analytics" text="Earnings dashboard with daily/monthly breakdowns, order stats, and trends." />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Three steps to done</h2>
          <p className="text-white/50 mb-14">Order prints in under 2 minutes</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Find a shop", d: "Browse shops at your campus. Compare B/W and color prices side by side." },
              { n: "02", t: "Upload & config", d: "Upload PDFs, set pages, copies, and print type. See the total instantly." },
              { n: "03", t: "Pay & collect", d: "Pay cash at the shop counter when you collect your prints. Simple and hassle-free." },
            ].map(({ n, t, d }) => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/8 transition-colors">
                <div className="font-display text-4xl font-black text-orange-500/40 mb-3">{n}</div>
                <h3 className="font-display font-semibold text-white mb-2">{t}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Stop waiting in queues.</h2>
          <p className="text-gray-500 mb-8">Join the smart way to print on campus.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register?role=student" className="btn-orange px-8 py-3.5 rounded-2xl text-base">I'm a Student →</Link>
            <Link to="/register?role=admin" className="btn-dark  px-8 py-3.5 rounded-2xl text-base">Add My Shop</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
