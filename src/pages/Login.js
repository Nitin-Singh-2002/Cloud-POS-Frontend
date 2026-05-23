import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1e1b4b,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:44 }}>🛒</div>
          <h1 style={{ fontSize:28, fontWeight:700, color:"#1e1b4b", margin:"8px 0 4px" }}>CloudPOS</h1>
          <p style={{ color:"#6b7280", fontSize:14 }}>Point of Sale System</p>
        </div>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Email</label>
            <input type="email" placeholder="Enter email" value={form.email}
              onChange={e => setForm({...form, email:e.target.value})} required
              style={{ width:"100%", padding:"11px 14px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none" }} />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Password</label>
            <input type="password" placeholder="Enter password" value={form.password}
              onChange={e => setForm({...form, password:e.target.value})} required
              style={{ width:"100%", padding:"11px 14px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none" }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, padding:14, fontSize:15, fontWeight:600, cursor:"pointer", marginTop:4 }}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
        {/* <p style={{ textAlign:"center", marginTop:16, fontSize:12, color:"#9ca3af" }}>
          admin@pos.com / admin123 &nbsp;|&nbsp; cashier@pos.com / cashier123
        </p> */}
      </div>
    </div>
  );
}
