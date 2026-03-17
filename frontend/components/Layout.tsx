"use client";

import WidgetRenderer from "@/components/WidgetRenderer";
import { useUIStore } from "@/lib/store";

export default function Layout() {
  const columns = useUIStore((store) => store.state.views.main?.layout.columns ?? []);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {columns.map((column, columnIndex) => (
        <section
          key={column.id}
          className="glass-panel rounded-[28px] p-4 shadow-glow"
          style={{ animationDelay: `${120 + columnIndex * 80}ms` }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">
                {column.id}
              </p>
              <h2 className="mt-1 text-lg font-medium text-white">
                Widget lane
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              {column.widget_ids.length} items
            </span>
          </div>

          <div className="grid gap-4">
            {column.widget_ids.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400">
                Waiting for AUIP patches for this column.
              </div>
            ) : (
              column.widget_ids.map((widgetId) => (
                <WidgetRenderer key={widgetId} widgetId={widgetId} />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
