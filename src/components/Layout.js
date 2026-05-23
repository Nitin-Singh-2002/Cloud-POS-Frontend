import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display:"flex" }}>
      <Sidebar />
      <main style={{ marginLeft:220, flex:1, padding:28, minHeight:"100vh", background:"#f0f2f5" }}>
        {children}
      </main>
    </div>
  );
}
