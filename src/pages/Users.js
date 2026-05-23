import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../utils/api";

const inp = { padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:13, outline:"none", width:"100%" };
const btn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:7, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer" });
const EMPTY = { name:"", email:"", password:"", role:"cashier" };

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await API.get("/auth/users");
    setUsers(data);
  };

  const save = async () => {
    if (!form.name || !form.email || !form.password) return toast.warning("All fields required");
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      toast.success("User created successfully");
      setShowForm(false);
      setForm(EMPTY);
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const toggle = async (id) => {
    await API.put(`/auth/users/${id}/toggle`);
    toast.success("User status updated");
    load();
  };

  const roleBadge = (role) => {
    const map = { admin:["#fef3c7","#92400e"], manager:["#dbeafe","#1e40af"], cashier:["#dcfce7","#166534"] };
    const [bg, color] = map[role] || ["#f3f4f6","#374151"];
    return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:bg, color, textTransform:"uppercase" }}>{role}</span>;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:"#111827" }}>👥 User Management</h2>
        <button onClick={() => { setShowForm(true); setForm(EMPTY); }} style={btn("#4f46e5")}>+ Add User</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ background:"#fff", borderRadius:14, padding:32, width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Create New User</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[["Full Name","name","text"],["Email","email","email"],["Password","password","password"]].map(([label,key,type]) => (
                <div key={key}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{label}</label>
                  <input style={inp} type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Role</label>
                <select style={inp} value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button onClick={save} disabled={loading} style={btn("#4f46e5")}>{loading?"Saving…":"Create User"}</button>
              <button onClick={() => setShowForm(false)} style={btn("#6b7280")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,.08)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              {["Name","Email","Role","Status","Joined","Actions"].map(h =>
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:"#6b7280", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"12px 16px", fontWeight:500, color:"#111827" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"#ede9fe", color:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td style={{ padding:"12px 16px", color:"#6b7280" }}>{u.email}</td>
                <td style={{ padding:"12px 16px" }}>{roleBadge(u.role)}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20,
                    background:u.isActive?"#f0fdf4":"#fef2f2", color:u.isActive?"#16a34a":"#ef4444" }}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding:"12px 16px", color:"#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                <td style={{ padding:"12px 16px" }}>
                  <button onClick={() => toggle(u._id)}
                    style={{ ...btn(u.isActive?"#ef4444":"#16a34a"), padding:"6px 14px", fontSize:12 }}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
