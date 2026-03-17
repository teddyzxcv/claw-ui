"use client";

import NewsWidget from "@/components/widgets/NewsWidget";
import CryptoWidget from "@/components/widgets/CryptoWidget";
import TextWidget from "@/components/widgets/TextWidget";
import TodoWidget from "@/components/widgets/TodoWidget";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import { useUIStore } from "@/lib/store";
import type { UIEvent, UIStateData, Widget } from "@/lib/types";
import { postUIEvent } from "@/lib/ws";

type WidgetRendererProps = {
  widgetId: string;
  state: UIStateData;
};

const registry: Record<string, (props: { widget: Widget }) => JSX.Element> = {
  "feed:news": NewsWidget,
  "info:weather": WeatherWidget,
  "finance:crypto": CryptoWidget,
  "productivity:todo": TodoWidget,
  "content:text": TextWidget,
};

export default function WidgetRenderer({ widgetId, state }: WidgetRendererProps) {
  const liveWidget = useUIStore((store) => store.state.widgets[widgetId]);
  const setLastError = useUIStore((store) => store.setLastError);
  const widget = liveWidget ?? state.widgets[widgetId];

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
    <article className="group relative glass-panel rounded-[20px] p-4 transition">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-medium text-white">{widget.title}</h3>
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
          aria-label="Dismiss"
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 opacity-0 transition hover:bg-white/[0.06] hover:text-slate-300 group-hover:opacity-100"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>
      </div>

      {Component ? (
        <Component widget={widget} />
      ) : (
        <p className="text-sm text-slate-500">
          Unsupported widget type.
        </p>
      )}
    </article>
  );
}
