"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Receipt from "@/components/Receipt";
import Logo from "@/components/Logo";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), { ssr: false });

export default function POS() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [payment, setPayment] = useState(0);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");
  const [receipt, setReceipt] = useState<any>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setNow(new Date().toLocaleString("en-PH"));
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  if (status === "loading" || !session) return null;

  const addToCart = (product: any) => {
    setScanError("");
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return setCart(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p));
  };

  const lookupBarcode = async (code: string) => {
    if (!code.trim()) return;
    setScanError("");

    // Try barcode first
    const res = await fetch(`/api/products/barcode/${code.trim()}`);
    if (res.ok) {
      addToCart(await res.json());
      setBarcodeInput("");
      barcodeRef.current?.focus();
      return;
    }

    // Fallback: match by product name (exact or starts with)
    const match = products.find(p =>
      p.name.toLowerCase() === code.trim().toLowerCase() ||
      p.name.toLowerCase().startsWith(code.trim().toLowerCase())
    );
    if (match) {
      addToCart(match);
      setBarcodeInput("");
      barcodeRef.current?.focus();
    } else {
      setScanError(`No product found for: ${code}`);
    }
  };

  const checkout = async () => {
    if (!cart.length || payment < total) return;
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, total, payment, change }),
    });
    setReceipt(await res.json());
  };

  const resetTransaction = () => {
    setReceipt(null);
    setCart([]);
    setPayment(0);
    fetch("/api/products").then(r => r.json()).then(setProducts);
    barcodeRef.current?.focus();
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const change = payment - total;
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(barcodeInput.toLowerCase()) ||
    (p.barcode && p.barcode.includes(barcodeInput))
  );
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      {/* Header */}
      <header className="bg-[#2f6b57] text-white px-5 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="border-l border-white/30 pl-3">
            <p className="font-bold text-sm">G7RR STORE</p>
            <p className="text-xs text-white/70">Point of Sale</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs items-center">
          <span className="text-white/60 text-xs hidden sm:block">👤 {session?.user?.name}</span>
          <a href="/admin" className="border border-white/40 hover:bg-white/10 text-white px-3 py-1.5 rounded font-medium transition">Admin</a>
          <a href="/reports" className="border border-white/40 hover:bg-white/10 text-white px-3 py-1.5 rounded font-medium transition">Reports</a>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="border border-white/40 hover:bg-red-500/30 text-white px-3 py-1.5 rounded font-medium transition">Logout</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left — Products */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">

          {/* Low stock banner */}
          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex gap-4 text-xs shrink-0">
              {lowStock.length > 0 && (
                <span className="text-amber-700 font-medium">
                  ⚠ Low stock: {lowStock.map(p => `${p.name} (${p.stock})`).join(", ")}
                </span>
              )}
              {outOfStock.length > 0 && (
                <span className="text-red-600 font-medium">
                  ✕ Out of stock: {outOfStock.map(p => p.name).join(", ")}
                </span>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex gap-2 shrink-0">
            <input
              ref={barcodeRef}
              type="text"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookupBarcode(barcodeInput)}
              placeholder="Search by name, barcode, or scan..."
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#2f6b57]"
              autoFocus
            />
            <button onClick={() => lookupBarcode(barcodeInput)} className="bg-[#2f6b57] text-white px-3 py-1.5 rounded text-sm hover:bg-[#1e4a3a]">Search</button>
            <button onClick={() => setShowScanner(true)} className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800">Camera</button>
          </div>

          {scanError && (
            <div className="bg-red-50 border-b border-red-200 text-red-600 text-xs px-4 py-2 shrink-0">{scanError}</div>
          )}

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2 content-start">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
                className="bg-white border border-gray-200 rounded p-3 text-left hover:border-[#2f6b57] hover:bg-green-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="font-semibold text-sm text-gray-800 truncate">{p.name}</p>
                <p className="text-[#2f6b57] font-bold text-sm mt-1">₱{p.price.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${p.stock < 5 ? "text-red-500" : "text-gray-400"}`}>
                  Stock: {p.stock}
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-4 text-center text-gray-400 text-sm py-10">No products found</p>
            )}
          </div>
        </div>

        {/* Right — Cart */}
        <div className="w-72 bg-white flex flex-col shrink-0">

          <div className="bg-[#2f6b57] text-white px-4 py-2.5 shrink-0">
            <p className="font-bold text-sm">CURRENT TRANSACTION</p>
            <p className="text-xs text-white/70">{now}</p>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No items added</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-2 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800 text-xs leading-tight">{item.name}</p>
                        <p className="text-gray-400 text-xs">₱{item.price.toFixed(2)}</p>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-5 h-5 border border-gray-300 rounded text-xs hover:bg-gray-100 leading-none">-</button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-5 h-5 border border-gray-300 rounded text-xs hover:bg-gray-100 leading-none">+</button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-xs text-gray-800">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 p-4 space-y-2.5 shrink-0 bg-gray-50">
            <div className="flex justify-between text-sm font-bold text-gray-800">
              <span>TOTAL</span>
              <span className="text-[#2f6b57] text-base">₱{total.toFixed(2)}</span>
            </div>
            <input
              type="number"
              placeholder="Cash tendered"
              value={payment || ""}
              onChange={e => setPayment(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-center font-bold focus:outline-none focus:border-[#2f6b57]"
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Change</span>
              <span className={`font-bold ${change < 0 ? "text-red-500" : "text-[#2f6b57]"}`}>
                ₱{change.toFixed(2)}
              </span>
            </div>
            <button
              onClick={checkout}
              disabled={cart.length === 0 || payment < total}
              className="w-full bg-[#2f6b57] hover:bg-[#1e4a3a] text-white font-bold py-2.5 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              COMPLETE SALE
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner onScan={code => { setShowScanner(false); lookupBarcode(code); }} onClose={() => setShowScanner(false)} />
      )}
      {receipt && <Receipt sale={receipt} onClose={resetTransaction} />}
    </div>
  );
}
