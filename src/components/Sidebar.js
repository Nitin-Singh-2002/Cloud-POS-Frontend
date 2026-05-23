import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const S = {
  sidebar:  { width:220, background:"#1e1b4b", height:"100vh", position:"fixed", top:0, left:0, display:"flex", flexDirection:"column", zIndex:100 },
  logo:     { display:"flex", alignItems:"center", gap:8, padding:"22px 20px", fontSize:18, fontWeight:700, color:"#a5b4fc", borderBottom:"1px solid #312e81" },
  userBox:  { display:"flex", alignItems:"center", gap:10, padding:"14px 20px", borderBottom:"1px solid #312e81" },
  avatar:   { width:36, height:36, borderRadius:"50%", background:"#4f46e5", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, flexShrink:0 },
  userName: { color:"#fff", fontSize:13, fontWeight:600, marginBottom:2 },
  badge:    { fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, textTransform:"uppercase" },
  nav:      { flex:1, paddingTop:8 },
  link:     { display:"flex", alignItems:"center", gap:10, padding:"12px 20px", textDecoration:"none", fontSize:14, transition:"background .2s" },
  logout:   { margin:"12px 16px", padding:"10px", background:"#ef4444", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 },
};

const badges = {
  admin:   { bg:"#fef3c7", color:"#92400e" },
  manager: { bg:"#dbeafe", color:"#1e40af" },
  cashier: { bg:"#dcfce7", color:"#166534" },
};

const navItems = [
  { label:"Dashboard",  path:"/",          icon:"📊", roles:["admin","manager","cashier"] },
  { label:"Billing",    path:"/billing",   icon:"🧾", roles:["admin","manager","cashier"] },
  { label:"Inventory",  path:"/inventory", icon:"📦", roles:["admin","manager"] },
  { label:"Reports",    path:"/reports",   icon:"📈", roles:["admin","manager"] },
  { label:"Users",      path:"/users",     icon:"👥", roles:["admin"] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const b = badges[user.role] || badges.cashier;

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside style={S.sidebar}>
      <div style={S.logo}><span>🛒</span> CloudPOS</div>
      <div style={S.userBox}>
        <div style={S.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
        <div>
          <div style={S.userName}>{user.name}</div>
          <span style={{ ...S.badge, background:b.bg, color:b.color }}>{user.role}</span>
        </div>
      </div>
      <nav style={S.nav}>
        {navItems.filter(i => i.roles.includes(user.role)).map(i => (
          <NavLink key={i.path} to={i.path} end={i.path==="/"} style={({ isActive }) => ({
            ...S.link, background: isActive ? "#312e81" : "transparent",
            color: isActive ? "#fff" : "#c7d2fe",
          })}>
            <span>{i.icon}</span><span>{i.label}</span>
          </NavLink>
        ))}
      </nav>
      <button onClick={logout} style={S.logout}>🚪 Logout</button>
    </aside>
  );
}
