"use client";

import WidgetRenderer from "@/components/WidgetRenderer";
import type { UIStateData } from "@/lib/types";

type LayoutProps = {
  state: UIStateData;
};

export default function Layout({ state }: LayoutProps) {
  const columns = state.views.main?.layout.columns ?? [];
  const hasWidgets = columns.some((c) => c.widget_ids.length > 0);

  if (!hasWidgets) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-white/[0.06] bg-white/[0.02]">
        <p className="text-sm text-slate-500">No content yet</p>
      </div>
    );
  }

  const filled = columns.filter((c) => c.widget_ids.length > 0);

  const gridColsClass = filled.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid ${gridColsClass} items-start gap-3`}>
      {filled.map((column, colIdx) => (
        <div key={column.id} className="flex flex-col gap-3">
          {column.widget_ids.map((widgetId, i) => (
            <div
              key={widgetId}
              className="stagger-in"
              style={{ animationDelay: `${colIdx * 60 + i * 60}ms` }}
            >
              <WidgetRenderer widgetId={widgetId} state={state} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

