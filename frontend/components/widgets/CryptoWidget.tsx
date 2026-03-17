import type { CryptoItem, Widget } from "@/lib/types";

type CryptoWidgetProps = {
  widget: Widget;
};

export default function CryptoWidget({ widget }: CryptoWidgetProps) {
  const items = ((widget.config.items as CryptoItem[] | undefined) ?? []).slice(0, 6);
  const currency = (widget.config.currency as string | undefined) ?? "USD";

  return (
    <div className="overflow-hidden rounded-[22px] border border-white/8">
      <div className="grid grid-cols-[1.2fr_1fr_0.9fr] bg-white/[0.04] px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">
        <span>Asset</span>
        <span>Price</span>
        <span className="text-right">24h</span>
      </div>
      <div className="divide-y divide-white/8">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400">No market data yet.</div>
        ) : (
          items.map((item) => {
            const positive = (item.change_24h ?? 0) >= 0;
            return (
              <div
                key={item.symbol}
                className="grid grid-cols-[1.2fr_1fr_0.9fr] items-center px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{item.symbol}</p>
                  <p className="text-xs text-slate-400">{item.name ?? "Crypto asset"}</p>
                </div>
                <p className="text-slate-200">
                  {currency} {item.price.toLocaleString()}
                </p>
                <p
                  className={`text-right font-medium ${
                    positive ? "text-moss" : "text-ember"
                  }`}
                >
                  {positive ? "+" : ""}
                  {item.change_24h?.toFixed(2) ?? "0.00"}%
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
