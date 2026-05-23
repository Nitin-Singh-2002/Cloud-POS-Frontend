import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import API from "../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const today = () => new Date().toISOString().split("T")[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; };

const statCard = (label, value, color) => (
  <div key={label} style={{ background:"#fff", borderRadius:12, padding:"18px 22px", boxShadow:"0 1px 4px rgba(0,0,0,.08)", borderTop:`3px solid ${color}` }}>
    <p style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{label}</p>
    <p style={{ fontSize:22, fontWeight:700, color:"#111827" }}>{value}</p>
  </div>
);

export default function Reports() {
  const [tab, setTab]           = useState("sales");
  const [from, setFrom]         = useState(monthStart());
  const [to, setTo]             = useState(today());
  const [salesData, setSalesData]       = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchReport(); }, [tab, from, to]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (tab === "sales") {
        const { data } = await API.get(`/reports/sales?from=${from}&to=${to}`);
        setSalesData(data);
      } else {
        const { data } = await API.get("/reports/inventory");
        setInventoryData(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const paymentChart = salesData ? {
    labels: Object.keys(salesData.byPayment).map(k => k.toUpperCase()),
    datasets: [{ data: Object.values(salesData.byPayment), backgroundColor: ["#4f46e5","#10b981","#f59e0b"], borderWidth: 0 }],
  } : null;

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding:"9px 24px", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
      background: tab===id ? "#4f46e5" : "#e5e7eb",
      color: tab===id ? "#fff" : "#374151",
    }}>{label}</button>
  );

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:20 }}>📈 Reports</h2>

      {/* Tab Switcher */}
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <TabBtn id="sales"     label="Sales Report" />
        <TabBtn id="inventory" label="Inventory Report" />
      </div>

      {/* Date filter (only for sales) */}
      {tab === "sales" && (
        <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20, background:"#fff", padding:"14px 20px", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
          <span style={{ fontSize:13, color:"#6b7280" }}>From:</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:13, outline:"none" }} />
          <span style={{ fontSize:13, color:"#6b7280" }}>To:</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:13, outline:"none" }} />
        </div>
      )}

      {loading && <p style={{ color:"#6b7280", padding:20 }}>Loading…</p>}

      {/* SALES REPORT */}
      {tab === "sales" && salesData && !loading && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            {statCard("Total Orders",     salesData.totalOrders, "#4f46e5")}
            {statCard("Total Revenue",    `₹${salesData.totalRevenue.toLocaleString("en-IN")}`, "#10b981")}
            {statCard("Total GST",        `₹${salesData.totalGST.toLocaleString("en-IN")}`, "#f59e0b")}
            {statCard("Avg Order Value",  `₹${salesData.avgOrderValue}`, "#8b5cf6")}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
            {paymentChart && (
              <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
                <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#374151" }}>Sales by Payment Method</h3>
                <Doughnut data={paymentChart} options={{ plugins:{ legend:{ position:"bottom" } } }} />
              </div>
            )}
            <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#374151" }}>Recent Invoices</h3>
              <div style={{ maxHeight:280, overflowY:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #e5e7eb" }}>
                      {["Invoice","Customer","Total","Method","Date"].map(h =>
                        <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:"#6b7280", fontWeight:600 }}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.sales.slice(0,20).map(s => (
                      <tr key={s._id} style={{ borderBottom:"1px solid #f9fafb" }}>
                        <td style={{ padding:"8px 10px", fontFamily:"monospace", color:"#4f46e5", fontSize:11 }}>{s.invoiceNumber}</td>
                        <td style={{ padding:"8px 10px", color:"#374151" }}>{s.customerName}</td>
                        <td style={{ padding:"8px 10px", fontWeight:600 }}>₹{s.grandTotal}</td>
                        <td style={{ padding:"8px 10px", textTransform:"uppercase", color:"#6b7280", fontSize:11 }}>{s.paymentMethod}</td>
                        <td style={{ padding:"8px 10px", color:"#9ca3af" }}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT */}
      {tab === "inventory" && inventoryData && !loading && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            {statCard("Total Products",   inventoryData.products.length, "#4f46e5")}
            {statCard("Inventory Value",  `₹${inventoryData.totalValue.toLocaleString("en-IN")}`, "#10b981")}
            {statCard("Low Stock Items",  inventoryData.lowStockCount, "#f59e0b")}
            {statCard("Out of Stock",     inventoryData.outOfStockCount, "#ef4444")}
          </div>
          <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,.08)", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f9fafb" }}>
                  {["Product","Category","Price","Stock","Value","Status"].map(h =>
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:"#6b7280", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {inventoryData.products.map(p => {
                  const low = p.stock <= p.lowStockAt;
                  return (
                    <tr key={p._id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                      <td style={{ padding:"11px 16px", fontWeight:500, color:"#111827" }}>{p.name}</td>
                      <td style={{ padding:"11px 16px", color:"#6b7280" }}>{p.category}</td>
                      <td style={{ padding:"11px 16px" }}>₹{p.price}</td>
                      <td style={{ padding:"11px 16px", fontWeight:600, color: p.stock===0?"#ef4444":low?"#d97706":"#16a34a" }}>{p.stock} {p.unit}</td>
                      <td style={{ padding:"11px 16px" }}>₹{(p.price * p.stock).toLocaleString("en-IN")}</td>
                      <td style={{ padding:"11px 16px" }}>
                        <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20,
                          background: p.stock===0?"#fef2f2":low?"#fef3c7":"#f0fdf4",
                          color: p.stock===0?"#ef4444":low?"#d97706":"#16a34a" }}>
                          {p.stock===0?"Out of Stock":low?"Low Stock":"In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
