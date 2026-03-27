"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import WidgetRenderer from "@/components/WidgetRenderer";
import type { UIStateData, Widget } from "@/lib/types";

type LayoutProps = {
  state: UIStateData;
};

type RenderedWidgetEntry = {
  id: string;
  columnId: string;
  widget: Widget;
  exiting?: boolean;
};

const EXIT_MS = 260;

const isMeaningfullyDifferent = (a: RenderedWidgetEntry[], b: RenderedWidgetEntry[]) => {
  if (a.length !== b.length) {
    return true;
  }

  return a.some((entry, index) => {
    const other = b[index];
    return (
      !other ||
      entry.id !== other.id ||
      entry.columnId !== other.columnId ||
      entry.exiting !== other.exiting ||
      JSON.stringify(entry.widget) !== JSON.stringify(other.widget)
    );
  });
};

export default function Layout({ state }: LayoutProps) {
  const columns = state.views.main?.layout.columns ?? [];

  const latestWidgets = useMemo(() => {
    const entries: RenderedWidgetEntry[] = [];

    columns.forEach((column) => {
      column.widget_ids.forEach((widgetId) => {
        const widget = state.widgets[widgetId];
        if (!widget) {
          return;
        }
        entries.push({
          id: widgetId,
          columnId: column.id,
          widget,
        });
      });
    });

    return entries;
  }, [columns, state.widgets]);

  const [renderedWidgets, setRenderedWidgets] = useState<RenderedWidgetEntry[]>(latestWidgets);
  const exitTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setRenderedWidgets((current) => {
      const nextById = new Map(latestWidgets.map((entry) => [entry.id, entry]));
      const merged: RenderedWidgetEntry[] = [];

      current.forEach((entry) => {
        const nextEntry = nextById.get(entry.id);
        if (nextEntry) {
          if (exitTimers.current[entry.id]) {
            clearTimeout(exitTimers.current[entry.id]);
            delete exitTimers.current[entry.id];
          }
          merged.push(nextEntry);
          nextById.delete(entry.id);
          return;
        }

        if (entry.exiting) {
          merged.push(entry);
          return;
        }

        const exitingEntry = { ...entry, exiting: true };
        merged.push(exitingEntry);
        exitTimers.current[entry.id] = setTimeout(() => {
          setRenderedWidgets((prev) => prev.filter((item) => item.id !== entry.id));
          delete exitTimers.current[entry.id];
        }, EXIT_MS);
      });

      nextById.forEach((entry) => {
        merged.push(entry);
      });

      if (!isMeaningfullyDifferent(current, merged)) {
        return current;
      }

      return merged;
    });
  }, [latestWidgets]);

  useEffect(() => {
    return () => {
      Object.values(exitTimers.current).forEach(clearTimeout);
    };
  }, []);

  const displayedColumns = columns
    .map((column) => ({
      ...column,
      items: renderedWidgets.filter((entry) => entry.columnId === column.id),
    }))
    .filter((column) => column.items.length > 0);

  if (displayedColumns.length === 0) {
    return (
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-line">
        <div className="text-center">
          <p className="text-sm text-muted">No content yet.</p>
        </div>
      </div>
    );
  }

  const gridColsClass = displayedColumns.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid ${gridColsClass} items-start gap-4`}>
      {displayedColumns.map((column, colIdx) => (
        <div key={column.id} className="flex flex-col gap-4">
          {column.items.map((entry, i) => (
            <div
              key={entry.id}
              className={`stagger-in transition-all duration-300 ease-out ${
                entry.exiting
                  ? "pointer-events-none scale-[0.985] -translate-y-1 opacity-0 blur-[1px]"
                  : "translate-y-0 opacity-100"
              }`}
              style={{ animationDelay: `${colIdx * 45 + i * 45}ms` }}
            >
              <WidgetRenderer widgetId={entry.id} state={state} widgetOverride={entry.widget} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
