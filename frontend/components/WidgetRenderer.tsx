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
    <article className="group glass-panel relative rounded-xl p-4 transition duration-200 ease-in-out hover:-translate-y-0.5 hover:border-coralMid/70">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h3 className="text-[18px] leading-6 text-text">{widget.title}</h3>
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
          aria-label="Remove widget"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-quiet opacity-0 transition hover:border-line hover:bg-panelAlt hover:text-coral group-hover:opacity-100"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>
      </div>

      {Component ? (
        <Component widget={widget} />
      ) : (
        <p className="text-sm text-quiet">Unsupported widget type.</p>
      )}
    </article>
  );
}
