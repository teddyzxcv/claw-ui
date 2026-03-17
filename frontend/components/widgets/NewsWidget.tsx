import type { NewsItem, Widget } from "@/lib/types";

type NewsWidgetProps = {
  widget: Widget;
};

export default function NewsWidget({ widget }: NewsWidgetProps) {
  const items = ((widget.config.items as NewsItem[] | undefined) ?? []).slice(0, 5);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No news items yet.</p>
      ) : (
        items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{item.title}</p>
              {item.source ? (
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-accent">
                  {item.source}
                </span>
              ) : null}
            </div>
            {item.summary ? (
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>
            ) : null}
            {item.url ? (
              <a
                className="mt-3 inline-block text-sm text-accent hover:text-white"
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
