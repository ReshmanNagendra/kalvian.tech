import { useState } from "react";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Watermark = () => (
  <div style={{
    position: "absolute", inset: 0, display: "flex", flexWrap: "wrap",
    gap: "18px", padding: "12px", opacity: 0.07, pointerEvents: "none",
    alignContent: "flex-start", overflow: "hidden",
  }}>
    {Array.from({ length: 60 }).map((_, i) => (
      <span key={i} style={{ fontSize: "13px", color: "#0a7a65", whiteSpace: "nowrap" }}>
        kalvian.tech
      </span>
    ))}
  </div>
);

export default function KalvianAuth() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to your auth backend
    console.log(tab, form);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", fontSize: "14px",
    border: "0.5px solid #b2dfd8", borderRadius: "8px",
    background: "#f0faf8", color: "#111", outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block", fontSize: "12px", color: "#5a7a74", marginBottom: "5px",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#e8f7f5", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "2rem",
      position: "relative", overflow: "hidden",
    }}>
      <Watermark />

      <div style={{
        background: "#fff", borderRadius: "16px", border: "0.5px solid #b2dfd8",
        padding: "2rem", width: "100%", maxWidth: "380px", position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "20px", fontWeight: 500, color: "#0a7a65", letterSpacing: "-0.3px" }}>
            kalvian.tech
          </div>
          <div style={{ fontSize: "12px", color: "#5a7a74", marginTop: "2px" }}>
            community for kalvium students
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "#e8f7f5", borderRadius: "8px",
          padding: "3px", marginBottom: "1.5rem",
        }}>
          {["login", "signup"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, textAlign: "center", padding: "7px", fontSize: "13px",
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "#0a7a65" : "#5a7a74",
              background: tab === t ? "#fff" : "transparent",
              border: tab === t ? "0.5px solid #b2dfd8" : "none",
              borderRadius: "6px", cursor: "pointer", transition: "all 0.15s",
              fontFamily: "inherit",
            }}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === "signup" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>full name</label>
              <input name="name" type="text" placeholder="your name"
                value={form.name} onChange={handleChange} style={inputStyle} />
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>email</label>
            <input name="email" type="email" placeholder="you@kalvium.community"
              value={form.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>password</label>
            <input name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} style={inputStyle} />
          </div>

          <button type="submit" style={{
            width: "100%", padding: "10px", background: "#1d9e75", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
            cursor: "pointer", marginTop: "0.25rem", fontFamily: "inherit",
            transition: "background 0.15s",
          }}
            onMouseOver={(e) => e.target.style.background = "#0f6e56"}
            onMouseOut={(e) => e.target.style.background = "#1d9e75"}
          >
            {tab === "login" ? "log in" : "create account"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "1.25rem 0" }}>
          <hr style={{ flex: 1, border: "none", borderTop: "0.5px solid #d0ebe6" }} />
          <span style={{ fontSize: "12px", color: "#5a7a74" }}>or</span>
          <hr style={{ flex: 1, border: "none", borderTop: "0.5px solid #d0ebe6" }} />
        </div>

        {/* Google */}
        <button style={{
          width: "100%", padding: "9px", display: "flex", alignItems: "center",
          justifyContent: "center", gap: "8px", border: "0.5px solid #b2dfd8",
          borderRadius: "8px", background: "#fff", fontSize: "13px",
          color: "#333", cursor: "pointer", fontFamily: "inherit",
          transition: "background 0.15s",
        }}
          onMouseOver={(e) => e.currentTarget.style.background = "#f0faf8"}
          onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
        >
          <GoogleIcon />
          continue with google
        </button>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "12px", color: "#5a7a74", marginTop: "1.25rem" }}>
          {tab === "login" ? (
            <>don't have an account?{" "}
              <span style={{ color: "#1d9e75", cursor: "pointer" }} onClick={() => setTab("signup")}>sign up</span>
            </>
          ) : (
            <>already have an account?{" "}
              <span style={{ color: "#1d9e75", cursor: "pointer" }} onClick={() => setTab("login")}>log in</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
