"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const empty = { name: "", price: "", stock: "", barcode: "" };

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/products").then(r => r.json()).then(setProducts);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock), barcode: form.barcode || null };
    if (editId !== null) {
      await fetch(`/api/products/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setMsg("Product updated.");
    } else {
      await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setMsg("Product added.");
    }
    setForm(empty); setEditId(null); setLoading(false); load();
    setTimeout(() => setMsg(""), 2500);
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), barcode: p.barcode ?? "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  };

  const inputCls = "w-full border border-gray-300 rounded px-3 py-1.5 text-sm mt-1 focus:outline-none focus:border-[#2f6b57]";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2f6b57] text-white px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="border-l border-white/30 pl-3">
            <p className="font-bold text-sm">G7RR STORE</p>
            <p className="text-xs text-white/70">Product Management</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <Link href="/" className="border border-white/40 hover:bg-white/10 text-white px-3 py-1.5 rounded font-medium transition">POS</Link>
          <Link href="/reports" className="border border-white/40 hover:bg-white/10 text-white px-3 py-1.5 rounded font-medium transition">Reports</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-5 grid grid-cols-3 gap-5">

        {/* Form */}
        <div className="col-span-1 bg-white border border-gray-200 rounded p-5">
          <h2 className="font-bold text-sm text-gray-700 mb-4 pb-2 border-b border-gray-100">
            {editId !== null ? "EDIT PRODUCT" : "ADD PRODUCT"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-semibold">Product Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Price (₱)</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Stock</label>
              <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Barcode (optional)</label>
              <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} className={inputCls} />
            </div>
            {msg && <p className="text-[#2f6b57] text-xs font-medium">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="flex-1 bg-[#2f6b57] hover:bg-[#1e4a3a] text-white py-2 rounded text-sm font-semibold disabled:opacity-50 transition">
                {editId !== null ? "Update" : "Add Product"}
              </button>
              {editId !== null && (
                <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="col-span-2 bg-white border border-gray-200 rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-700">PRODUCTS</h2>
            <span className="text-xs text-gray-400">{products.length} total</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-right">Price</th>
                <th className="px-4 py-2.5 text-right">Stock</th>
                <th className="px-4 py-2.5 text-left">Barcode</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-800">₱{p.price.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${p.stock < 5 ? "text-red-500" : "text-gray-700"}`}>{p.stock}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{p.barcode ?? "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => handleEdit(p)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium transition">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1 rounded text-xs font-medium transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
