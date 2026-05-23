import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import API from "../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const card = (bg, icon, label, value, sub) => (
  <div key={label} style={{ background:"#fff", borderRadius:12, padding:"20px 24px", boxShadow:"0 1px 4px rgba(0,0,0,.08)", borderLeft:`4px solid ${bg}` }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <p style={{ fontSize:13, color:"#6b7280", marginBottom:6 }}>{label}</p>
        <p style={{ fontSize:26, fontWeight:700, color:"#111827" }}>{value}</p>
        {sub && <p style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{sub}</p>}
      </div>
      <span style={{ fontSize:28 }}>{icon}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/sales/dashboard"), API.get("/alerts/low-stock")])
      .then(([s, a]) => { setStats(s.data); setAlerts(a.data.products); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, fontSize:18 }}>Loading dashboard…</div>;

  const chartData = {
    labels: stats.last7.map(d => d.date),
    datasets: [{
      label: "Revenue (₹)",
      data: stats.last7.map(d => d.revenue),
      backgroundColor: "#818cf8",
      borderRadius: 6,
    }],
  };

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:24 }}>Dashboard</h2>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div style={{ background:"#fef3c7", border:"1px solid #f59e0b", borderRadius:10, padding:"12px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <span style={{ fontSize:14, color:"#92400e", fontWeight:500 }}>
            {alerts.length} product{alerts.length > 1 ? "s are" : " is"} low on stock!&nbsp;
            {alerts.map(p => p.name).join(", ")}
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {card("#4f46e5","🧾","Today's Sales",    stats.todaySales,   `₹${stats.todayRevenue.toLocaleString("en-IN")}`)}
        {card("#10b981","💰","Today's Revenue",  `₹${stats.todayRevenue.toLocaleString("en-IN")}`, "")}
        {card("#f59e0b","📦","Month Sales",       stats.monthSales,   `₹${stats.monthRevenue.toLocaleString("en-IN")}`)}
        {card("#ef4444","🚨","Low Stock Items",   alerts.length,      "Need restocking")}
      </div>

      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:"#374151", marginBottom:16 }}>Revenue — Last 7 Days</h3>
          <Bar data={chartData} options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }} />
        </div>

        <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:"#374151", marginBottom:16 }}>Top Products This Month</h3>
          {stats.topProducts.length === 0
            ? <p style={{ color:"#9ca3af", fontSize:14 }}>No sales yet this month.</p>
            : stats.topProducts.map((p, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:24, height:24, borderRadius:"50%", background:"#ede9fe", color:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{i+1}</span>
                  <span style={{ fontSize:13, color:"#374151" }}>{p.name}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:"#4f46e5" }}>{p.qty} sold</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
