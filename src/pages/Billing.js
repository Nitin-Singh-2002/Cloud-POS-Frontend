import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import API from "../utils/api";

const inp = { padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:13, outline:"none", width:"100%" };
const btn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:7, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer" });

export default function Billing() {
  const [products, setProducts]     = useState([]);
  const [search, setSearch]         = useState("");
  const [cart, setCart]             = useState([]);
  const [payment, setPayment]       = useState("cash");
  const [customer, setCustomer]     = useState("");
  const [phone, setPhone]           = useState("");
  // const [barcode, setBarcode]       = useState("");
  const [lastInvoice, setLastInvoice] = useState(null);
  const barcodeRef = useRef();

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    if (search) loadProducts(search);
  }, [search]);

  const loadProducts = async (q = "") => {
    const { data } = await API.get(`/products?search=${q}`);
    setProducts(data);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch("");
  };

  // const handleBarcodeEnter = async (e) => {
  //   if (e.key !== "Enter" || !barcode) return;
  //   try {
  //     const { data } = await API.get(`/products/barcode/${barcode}`);
  //     addToCart(data);
  //     setBarcode("");
  //   } catch { toast.error("Product not found for this barcode"); }
  // };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const calcItem = (item) => {
    const base = item.price * item.qty;
    const gst  = parseFloat(((base * item.gstRate) / 100).toFixed(2));
    return { base, gst, total: parseFloat((base + gst).toFixed(2)) };
  };

  const subtotal   = cart.reduce((s, i) => s + calcItem(i).base, 0);
  const totalGST   = cart.reduce((s, i) => s + calcItem(i).gst, 0);
  const grandTotal = parseFloat((subtotal + totalGST).toFixed(2));

  const checkout = async () => {
    if (cart.length === 0) return toast.warning("Cart is empty!");
    try {
      const { data } = await API.post("/sales", {
        items: cart.map(i => ({ product: i._id, quantity: i.qty })),
        paymentMethod: payment,
        customerName: customer || "Walk-in Customer",
        customerPhone: phone,
      });
      setLastInvoice(data);
      setCart([]);
      setCustomer("");
      setPhone("");
      toast.success(`Sale complete! Invoice: ${data.invoiceNumber}`);
    } catch (err) { toast.error(err.response?.data?.message || "Sale failed"); }
  };

  const printInvoice = () => {
    if (!lastInvoice) return;
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Invoice ${lastInvoice.invoiceNumber}</title>
      <style>
        body { font-family: monospace; max-width:400px; margin:20px auto; font-size:13px; }
        h2 { text-align:center; font-size:18px; margin:0 0 4px; }
        p { margin:2px 0; }
        .center { text-align:center; }
        hr { border:none; border-top:1px dashed #000; margin:10px 0; }
        table { width:100%; font-size:12px; border-collapse:collapse; }
        th { text-align:left; border-bottom:1px solid #000; padding:4px 0; }
        td { padding:4px 0; vertical-align:top; }
        .right { text-align:right; }
        .total-row td { font-weight:bold; border-top:1px solid #000; padding-top:6px; }
      </style></head><body>
      <h2>🛒 CloudPOS</h2>
      <p class="center">Tax Invoice</p>
      <hr/>
      <p>Invoice: <b>${lastInvoice.invoiceNumber}</b></p>
      <p>Date: ${new Date(lastInvoice.createdAt).toLocaleString("en-IN")}</p>
      <p>Customer: ${lastInvoice.customerName}</p>
      ${lastInvoice.customerPhone ? `<p>Phone: ${lastInvoice.customerPhone}</p>` : ""}
      <p>Cashier: ${lastInvoice.cashierName}</p>
      <p>Payment: ${lastInvoice.paymentMethod.toUpperCase()}</p>
      <hr/>
      <table>
        <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">GST</th><th class="right">Total</th></tr>
        ${lastInvoice.items.map(i => `
          <tr>
            <td>${i.productName}</td>
            <td class="right">${i.quantity}</td>
            <td class="right">₹${i.price}</td>
            <td class="right">${i.gstRate}%</td>
            <td class="right">₹${i.total.toFixed(2)}</td>
          </tr>`).join("")}
        <tr class="total-row">
          <td colspan="4">Subtotal</td><td class="right">₹${lastInvoice.subtotal.toFixed(2)}</td>
        </tr>
        <tr><td colspan="4">Total GST</td><td class="right">₹${lastInvoice.totalGST.toFixed(2)}</td></tr>
        <tr><td colspan="4"><b>Grand Total</b></td><td class="right"><b>₹${lastInvoice.grandTotal.toFixed(2)}</b></td></tr>
      </table>
      <hr/><p class="center">Thank you for shopping!</p>
      <p class="center" style="font-size:11px;color:#666">Generated by CloudPOS</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:20 }}>Billing</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20 }}>

        {/* LEFT: Product Search */}
        <div>
          {/* Barcode Input
          <div style={{ background:"#fff", borderRadius:12, padding:20, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
            <p style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>📷 Barcode Scanner</p>
            <input ref={barcodeRef} style={inp} placeholder="Scan or type barcode, press Enter…"
              value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={handleBarcodeEnter} />
          </div> */}

          {/* Product Search */}
          <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
            <p style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>🔍 Search Products</p>
            <input style={{ ...inp, marginBottom:12 }} placeholder="Type product name…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
              {products.map(p => (
                <div key={p._id} onClick={() => addToCart(p)}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:8, cursor:"pointer", transition:"background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="#f5f3ff"}
                  onMouseLeave={e => e.currentTarget.style.background="#fff"}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:500, color:"#111827" }}>{p.name}</p>
                    <p style={{ fontSize:12, color:"#6b7280" }}>{p.category} &nbsp;|&nbsp; GST: {p.gstRate}% &nbsp;|&nbsp; Stock: {p.stock}</p>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:"#4f46e5" }}>₹{p.price}</p>
                </div>
              ))}
              {products.length === 0 && <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:20 }}>No products found</p>}
            </div>
          </div>
        </div>

        {/* RIGHT: Cart & Checkout */}
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.08)", display:"flex", flexDirection:"column", gap:14 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#111827" }}>🛒 Cart ({cart.length} items)</h3>

          {/* Customer Info */}
          <input style={inp} placeholder="Customer name (optional)" value={customer} onChange={e => setCustomer(e.target.value)} />
          <input style={inp} placeholder="Phone number (optional)"  value={phone}    onChange={e => setPhone(e.target.value)} />

          {/* Cart Items */}
          <div style={{ flex:1, maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
            {cart.length === 0 && <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:24 }}>Add products from the left</p>}
            {cart.map(item => {
              const { base, gst, total } = calcItem(item);
              return (
                <div key={item._id} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <p style={{ fontSize:13, fontWeight:500, color:"#111827", flex:1 }}>{item.name}</p>
                    <button onClick={() => removeItem(item._id)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:16, padding:0 }}>✕</button>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <button onClick={() => updateQty(item._id, item.qty-1)} style={{ width:26, height:26, borderRadius:"50%", border:"1px solid #d1d5db", background:"#f9fafb", cursor:"pointer", fontSize:16 }}>−</button>
                      <span style={{ fontSize:14, fontWeight:600, minWidth:20, textAlign:"center" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty+1)} style={{ width:26, height:26, borderRadius:"50%", border:"1px solid #d1d5db", background:"#f9fafb", cursor:"pointer", fontSize:16 }}>+</button>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#111827" }}>₹{total.toFixed(2)}</p>
                      <p style={{ fontSize:11, color:"#9ca3af" }}>GST ₹{gst.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div style={{ borderTop:"1px dashed #e5e7eb", paddingTop:12, display:"flex", flexDirection:"column", gap:6 }}>
            {[["Subtotal", `₹${subtotal.toFixed(2)}`], ["Total GST", `₹${totalGST.toFixed(2)}`]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>{l}</span>
                <span style={{ fontSize:13, color:"#374151" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Grand Total</span>
              <span style={{ fontSize:18, fontWeight:700, color:"#4f46e5" }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>Payment Method</p>
            <div style={{ display:"flex", gap:8 }}>
              {["cash","card","upi"].map(m => (
                <button key={m} onClick={() => setPayment(m)}
                  style={{ ...btn(payment===m?"#4f46e5":"#e5e7eb"), color:payment===m?"#fff":"#374151", flex:1, padding:"8px 0", textTransform:"uppercase", fontSize:12 }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button onClick={checkout} style={{ ...btn("#16a34a"), padding:13, fontSize:15 }}>
            ✅ Complete Sale
          </button>

          {lastInvoice && (
            <button onClick={printInvoice} style={{ ...btn("#0891b2"), padding:10, fontSize:13 }}>
              🖨️ Print Invoice ({lastInvoice.invoiceNumber})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
