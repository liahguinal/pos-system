"use client";

interface ReceiptProps {
  sale: any;
  onClose: () => void;
}

export default function Receipt({ sale, onClose }: ReceiptProps) {
  const date = new Date(sale.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const time = new Date(sale.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  const totalItems = sale.items.reduce((s: number, i: any) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-72 rounded shadow-xl font-mono text-xs overflow-hidden">

        {/* Header */}
        <div className="bg-[#2f6b57] text-white text-center py-4 px-4">
          <p className="font-black text-base tracking-widest">G7RR STORE</p>
          <p className="text-white/70 text-xs mt-0.5">123 Rizal Ave, Manila</p>
          <p className="text-white/70 text-xs">Tel: (02) 8-123-4567</p>
        </div>

        <div className="px-4 py-3 space-y-3">

          {/* TXN info */}
          <div className="flex justify-between text-gray-500">
            <div>
              <p>TXN #: <span className="text-gray-800 font-bold">{sale.id}</span></p>
              <p>Cashier: POS Terminal</p>
            </div>
            <div className="text-right">
              <p>{date}</p>
              <p>{time}</p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300" />

          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item: any) => (
              <div key={item.id}>
                <p className="font-semibold text-gray-800">{item.product.name}</p>
                <div className="flex justify-between text-gray-500">
                  <span>{item.quantity} x ₱{item.price.toFixed(2)}</span>
                  <span className="font-semibold text-gray-800">₱{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300" />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>No. of Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-gray-900">
              <span>TOTAL</span>
              <span>₱{sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Cash</span>
              <span>₱{sale.payment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800">
              <span>Change</span>
              <span>₱{sale.change.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300" />

          {/* Footer */}
          <div className="text-center text-gray-400 space-y-0.5">
            <p>Thank you for shopping at G7RR!</p>
            <p>Please come again.</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#2f6b57] hover:bg-[#1e4a3a] text-white font-bold py-2.5 rounded text-sm transition"
          >
            New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
