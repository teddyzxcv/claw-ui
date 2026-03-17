"use client";

import type { TodoItem, UIEvent, Widget } from "@/lib/types";
import { useUIStore } from "@/lib/store";
import { postUIEvent } from "@/lib/ws";

type TodoWidgetProps = {
  widget: Widget;
};

export default function TodoWidget({ widget }: TodoWidgetProps) {
  const items = ((widget.config.items as TodoItem[] | undefined) ?? []).slice(0, 8);
  const setLastError = useUIStore((store) => store.setLastError);

  const toggleItem = async (itemId: string) => {
    const event: UIEvent = {
      type: "ui_event",
      payload: {
        event: "todo_toggled",
        widget_id: widget.id,
        item_id: itemId,
      },
    };

    try {
      await postUIEvent(event);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Failed to toggle todo item.");
    }
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No checklist items yet.</p>
      ) : (
        items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:border-white/15"
          >
            <input
              type="checkbox"
              checked={Boolean(item.done)}
              onChange={() => void toggleItem(item.id)}
              className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
            />
            <span
              className={`text-sm ${
                item.done ? "text-slate-500 line-through" : "text-slate-100"
              }`}
            >
              {item.label}
            </span>
          </label>
        ))
      )}
    </div>
  );
}
