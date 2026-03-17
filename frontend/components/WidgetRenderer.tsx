"use client";

import NewsWidget from "@/components/widgets/NewsWidget";
import CryptoWidget from "@/components/widgets/CryptoWidget";
import TextWidget from "@/components/widgets/TextWidget";
import TodoWidget from "@/components/widgets/TodoWidget";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import { useUIStore } from "@/lib/store";
import type { UIEvent, Widget } from "@/lib/types";
import { postUIEvent } from "@/lib/ws";

type WidgetRendererProps = {
  widgetId: string;
};

const registry: Record<string, (props: { widget: Widget }) => JSX.Element> = {
  "feed:news": NewsWidget,
  "info:weather": WeatherWidget,
  "finance:crypto": CryptoWidget,
  "productivity:todo": TodoWidget,
  "content:text": TextWidget,
};

export default function WidgetRenderer({ widgetId }: WidgetRendererProps) {
  const widget = useUIStore((store) => store.state.widgets[widgetId]);
  const setLastError = useUIStore((store) => store.setLastError);

  if (!widget) {
    return null;
  }

  const key = `${widget.kind}:${widget.variant}`;
  const Component = registry[key];

  const sendEvent = async (event: UIEvent) => {
    try {
      await postUIEvent(event);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Failed to post UI event.");
    }
  };

  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm shadow-[0_16px_48px_rgba(2,8,20,0.28)] transition hover:border-white/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
            {widget.kind}:{widget.variant}
          </p>
          <h3 className="mt-2 text-lg font-medium text-white">{widget.title}</h3>
        </div>
        <button
          type="button"
          onClick={() =>
            void sendEvent({
              type: "ui_event",
              payload: {
                event: "widget_removed",
                widget_id: widget.id,
              },
            })
          }
          className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300 transition hover:border-ember/50 hover:bg-ember/10 hover:text-white"
        >
          Remove
        </button>
      </div>

      {Component ? (
        <Component widget={widget} />
      ) : (
        <div className="rounded-2xl border border-dashed border-ember/40 bg-ember/10 px-4 py-6 text-sm text-orange-100">
          No renderer registered for {key}.
        </div>
      )}
    </article>
  );
}
