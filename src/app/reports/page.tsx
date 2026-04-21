"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const load = async (d: string) => {
    setLoading(true);
    const res = await fetch(`/api/reports?date=${d}`);
    setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(date); }, []);

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2f6b57] text-white px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="border-l border-white/30 pl-3">
            <p className="font-bold text-sm">G7RR STORE</p>
            <p className="text-xs text-white/70">Daily Sales Report</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <Link href="/" className="border border-white/40 hover:bg-white/10 text-white px-3 py-1.5 rounded font-medium transition">POS</Link>
          <Link href="/admin" className="border border-white/40 hover:bg-white/10 text-white px-3 py-1.5 rounded font-medium transition">Admin</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-5 space-y-4">

        {/* Date filter */}
        <div className="bg-white border border-gray-200 rounded p-4 flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium">Date:</label>
          <input
            type="date" value={date} max={today}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#2f6b57]"
          />
          <button onClick={() => load(date)} className="bg-[#2f6b57] hover:bg-[#1e4a3a] text-white px-4 py-1.5 rounded text-sm font-medium transition">
            Load
          </button>
        </div>

        {loading && <p className="text-center text-gray-400 text-sm py-8">Loading...</p>}

        {data && !loading && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Revenue</p>
                <p className="text-2xl font-black text-[#2f6b57]">₱{data.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Transactions</p>
                <p className="text-2xl font-black text-gray-800">{data.totalTransactions}</p>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="font-bold text-sm text-gray-700">TRANSACTIONS</h2>
                <span className="text-xs text-gray-400">{data.date}</span>
              </div>
              {data.sales.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-sm">No sales on this date</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.sales.map((sale: any) => (
                    <div key={sale.id} className="px-4 py-3 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-500">TXN #{sale.id}</span>
                          <span className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleTimeString("en-PH")}</span>
                        </div>
                        <span className="font-bold text-[#2f6b57]">₱{sale.total.toFixed(2)}</span>
                      </div>
                      <div className="space-y-0.5 pl-2 border-l-2 border-gray-100">
                        {sale.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs text-gray-500">
                            <span>{item.product.name} x{item.quantity}</span>
                            <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
