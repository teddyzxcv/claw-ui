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
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-line">
        <div className="text-center">
          <p className="text-sm text-muted">No content yet.</p>
        </div>
      </div>
    );
  }

  const filled = columns.filter((c) => c.widget_ids.length > 0);

  const gridColsClass = filled.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid ${gridColsClass} items-start gap-4`}>
      {filled.map((column, colIdx) => (
        <div key={column.id} className="flex flex-col gap-4">
          {column.widget_ids.map((widgetId, i) => (
            <div
              key={widgetId}
              className="stagger-in"
              style={{ animationDelay: `${colIdx * 45 + i * 45}ms` }}
            >
              <WidgetRenderer widgetId={widgetId} state={state} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
