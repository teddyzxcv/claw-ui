import type { CryptoItem, Widget } from "@/lib/types";

type CryptoWidgetProps = {
  widget: Widget;
};

export default function CryptoWidget({ widget }: CryptoWidgetProps) {
  const items = ((widget.config.items as CryptoItem[] | undefined) ?? []).slice(0, 6);
  const currency = (widget.config.currency as string | undefined) ?? "USD";

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-[1.2fr_1fr_0.9fr] bg-panelAlt px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-quiet">
        <span>Asset</span>
        <span>Price</span>
        <span className="text-right">24h</span>
      </div>
      <div className="divide-y divide-line">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-quiet">No market data yet.</div>
        ) : (
          items.map((item) => {
            const positive = (item.change_24h ?? 0) >= 0;
            return (
              <div
                key={item.symbol}
                className="grid grid-cols-[1.2fr_1fr_0.9fr] items-center bg-panel px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-text">{item.symbol}</p>
                  <p className="text-xs text-quiet">{item.name ?? "Crypto asset"}</p>
                </div>
                <p className="text-secondary">
                  {currency} {item.price.toLocaleString()}
                </p>
                <p
                  className={`text-right font-medium ${
                    positive ? "text-coral" : "text-coralDark"
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
