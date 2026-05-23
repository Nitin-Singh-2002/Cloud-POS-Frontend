import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../utils/api";

const inp = { padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:13, outline:"none", width:"100%" };
const btn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:7, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer" });

const EMPTY = { name:"", category:"General", price:"", gstRate:18, stock:"", lowStockAt:10, unit:"pcs", description:"" };
const GST_RATES = [0, 5, 18, 40];

// barcode:"",

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { load(); }, [search]);

  const load = async () => {
    const { data } = await API.get(`/products?search=${search}`);
    setProducts(data);
  };

  const openNew  = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name:p.name, category:p.category, price:p.price, gstRate:p.gstRate, stock:p.stock, lowStockAt:p.lowStockAt, unit:p.unit, description:p.description||"" });
    setEditId(p._id);
    setShowForm(true);
  };

  // barcode:p.barcode||"",

  const save = async () => {
    if (!form.name || !form.price || form.stock === "") return toast.warning("Name, Price and Stock are required");
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/products/${editId}`, form);
        toast.success("Product updated");
      } else {
        await API.post("/products", form);
        toast.success("Product added");
      }
      setShowForm(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:"#111827" }}>📦 Inventory</h2>
        <button onClick={openNew} style={btn("#4f46e5")}>+ Add Product</button>
      </div>

      {/* Search */}
      <input style={{ ...inp, maxWidth:340, marginBottom:16 }} placeholder="Search products…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* Modal Form */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ background:"#fff", borderRadius:14, padding:32, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>{editId ? "Edit Product" : "Add Product"}</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[["Product Name","name","text",true]].map(([label,key,type,req]) => (
                // ,["Barcode","barcode","text",false]
                <div key={key} style={{ gridColumn: key==="name" ? "span 2" : "" }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{label}{req?" *":""}</label>
                  <input style={inp} type={type} value={form[key]} onChange={f(key)} required={req} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Category</label>
                <input style={inp} value={form.category} onChange={f("category")} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Unit</label>
                <input style={inp} value={form.unit} onChange={f("unit")} placeholder="pcs, kg, L…" />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Price (₹) *</label>
                <input style={inp} type="number" value={form.price} onChange={f("price")} min="0" />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>GST Rate (%)</label>
                <select style={inp} value={form.gstRate} onChange={f("gstRate")}>
                  {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Stock *</label>
                <input style={inp} type="number" value={form.stock} onChange={f("stock")} min="0" />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Low Stock Alert</label>
                <input style={inp} type="number" value={form.lowStockAt} onChange={f("lowStockAt")} min="0" />
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Description</label>
                <input style={inp} value={form.description} onChange={f("description")} />
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button onClick={save} disabled={loading} style={btn("#4f46e5")}>{loading ? "Saving…" : "Save Product"}</button>
              <button onClick={() => setShowForm(false)} style={{ ...btn("#6b7280") }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,.08)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              {["Name","Category","Price","GST","Stock","Status","Actions"].map(h => (
                // "Barcode",
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:"#6b7280", borderBottom:"1px solid #e5e7eb", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const lowStock = p.stock <= p.lowStockAt;
              return (
                <tr key={p._id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                  <td style={{ padding:"12px 16px", fontWeight:500, color:"#111827" }}>{p.name}</td>
                  {/* <td style={{ padding:"12px 16px", color:"#6b7280", fontFamily:"monospace", fontSize:12 }}>{p.barcode || "—"}</td> */}
                  <td style={{ padding:"12px 16px", color:"#6b7280" }}>{p.category}</td>
                  <td style={{ padding:"12px 16px", fontWeight:600, color:"#111827" }}>₹{p.price}</td>
                  <td style={{ padding:"12px 16px", color:"#6b7280" }}>{p.gstRate}%</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontWeight:600, color: p.stock === 0 ? "#ef4444" : lowStock ? "#f59e0b" : "#16a34a" }}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20,
                      background: p.stock===0?"#fef2f2": lowStock?"#fef3c7":"#f0fdf4",
                      color:       p.stock===0?"#ef4444": lowStock?"#d97706":"#16a34a" }}>
                      {p.stock === 0 ? "Out of Stock" : lowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => openEdit(p)} style={{ ...btn("#4f46e5"), padding:"6px 12px", fontSize:12 }}>Edit</button>
                      <button onClick={() => remove(p._id)} style={{ ...btn("#ef4444"), padding:"6px 12px", fontSize:12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:"#9ca3af" }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
