import type { NewsItem, Widget } from "@/lib/types";

type NewsWidgetProps = {
  widget: Widget;
};

export default function NewsWidget({ widget }: NewsWidgetProps) {
  const items = ((widget.config.items as NewsItem[] | undefined) ?? []).slice(0, 5);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-quiet">No news items yet.</p>
      ) : (
        items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-xl border border-line bg-panelAlt/70 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm leading-6 text-text">{item.title}</p>
              {item.source ? (
                <span className="rounded-full border border-coralMid/25 bg-coralMid/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-coral">
                  {item.source}
                </span>
              ) : null}
            </div>
            {item.summary ? (
              <p className="mt-2 text-sm leading-6 text-secondary">{item.summary}</p>
            ) : null}
            {item.url ? (
              <a
                className="mt-3 inline-block text-sm text-coral transition hover:text-text"
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                Open story
              </a>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
