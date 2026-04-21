"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), {
  ssr: false,
});

export default function POS() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [payment, setPayment] = useState(0);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const addToCart = (product: any) => {
    setScanError("");
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const lookupBarcode = async (code: string) => {
    if (!code.trim()) return;
    setScanError("");

    const res = await fetch(`/api/products/barcode/${code.trim()}`);
    if (res.ok) {
      const product = await res.json();
      addToCart(product);
      setBarcodeInput("");
      barcodeRef.current?.focus();
    } else {
      setScanError(`No product found for barcode: ${code}`);
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") lookupBarcode(barcodeInput);
  };

  const handleCameraScan = (code: string) => {
    setShowScanner(false);
    lookupBarcode(code);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = payment - total;

  const checkout = async () => {
    if (cart.length === 0) return;
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, total, payment, change }),
    });
    alert("Sale completed!");
    setCart([]);
    setPayment(0);
    barcodeRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4">

        {/* Left: Products + Barcode */}
        <div className="col-span-2 space-y-4">

          {/* Barcode input */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Scan / Enter Barcode</h2>
            <div className="flex gap-2">
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="Scan or type barcode, press Enter"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
              <button
                onClick={() => lookupBarcode(barcodeInput)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              >
                Search
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                title="Use camera"
              >
                📷
              </button>
            </div>
            {scanError && (
              <p className="text-red-500 text-sm mt-2">{scanError}</p>
            )}
          </div>

          {/* Product grid */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Products</h2>
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 bg-gray-100 rounded-lg text-left hover:bg-blue-50 border border-transparent hover:border-blue-300 transition"
                >
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-blue-600 text-sm">₱{p.price}</p>
                  <p className="text-gray-400 text-xs">Stock: {p.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-3 h-fit">
          <h2 className="font-semibold text-lg">Cart</h2>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm">No items yet</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">x{item.quantity} × ₱{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <input
            type="number"
            placeholder="Payment amount"
            value={payment || ""}
            onChange={(e) => setPayment(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex justify-between text-sm text-gray-600">
            <span>Change</span>
            <span className={change < 0 ? "text-red-500" : "text-green-600"}>
              ₱{change.toFixed(2)}
            </span>
          </div>

          <button
            onClick={checkout}
            disabled={cart.length === 0 || payment < total}
            className="bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Complete Sale
          </button>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleCameraScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
