"use client";

import { create } from "zustand";

import type {
  ColumnLayout,
  Operation,
  UIStateData,
  ViewLayout,
  Widget,
} from "@/lib/types";

const defaultState = (): UIStateData => ({
  views: {
    main: {
      layout: {
        columns: [
          { id: "col_1", widget_ids: [] },
          { id: "col_2", widget_ids: [] },
        ],
      },
    },
  },
  widgets: {},
});

const cloneState = (state: UIStateData): UIStateData =>
  JSON.parse(JSON.stringify(state)) as UIStateData;

const findColumn = (layout: ViewLayout, columnId: string): ColumnLayout => {
  const column = layout.columns.find((entry) => entry.id === columnId);
  if (!column) {
    throw new Error(`Unknown column '${columnId}'.`);
  }
  return column;
};

const findWidgetColumn = (layout: ViewLayout, widgetId: string): ColumnLayout => {
  const column = layout.columns.find((entry) => entry.widget_ids.includes(widgetId));
  if (!column) {
    throw new Error(`Widget '${widgetId}' is not placed in the layout.`);
  }
  return column;
};

const applyOperation = (draft: UIStateData, operation: Operation) => {
  const view = draft.views.main;
  switch (operation.op) {
    case "add_widget": {
      const column = findColumn(view.layout, operation.placement.column_id);
      const position = Math.min(operation.placement.position, column.widget_ids.length);
      column.widget_ids.splice(position, 0, operation.widget.id);
      draft.widgets[operation.widget.id] = operation.widget;
      return;
    }
    case "remove_widget": {
      delete draft.widgets[operation.widget_id];
      view.layout.columns.forEach((column) => {
        column.widget_ids = column.widget_ids.filter((id) => id !== operation.widget_id);
      });
      return;
    }
    case "move_widget": {
      const currentColumn = findWidgetColumn(view.layout, operation.widget_id);
      const targetColumn = findColumn(view.layout, operation.placement.column_id);
      currentColumn.widget_ids = currentColumn.widget_ids.filter(
        (id) => id !== operation.widget_id,
      );
      const position = Math.min(operation.placement.position, targetColumn.widget_ids.length);
      targetColumn.widget_ids.splice(position, 0, operation.widget_id);
      return;
    }
    case "update_widget": {
      const widget = draft.widgets[operation.widget_id];
      if (!widget) {
        return;
      }
      draft.widgets[operation.widget_id] = {
        ...widget,
        ...operation.changes,
        config: operation.changes.config ?? widget.config,
      } as Widget;
      return;
    }
    case "set_layout": {
      draft.views.main.layout = operation.layout;
      return;
    }
  }
};

type UIStore = {
  state: UIStateData;
  connectionState: ConnectionState;
  lastError: string | null;
  setState: (state: UIStateData) => void;
  applyPatch: (operations: Operation[]) => void;
  setConnectionState: (value: UIStore["connectionState"]) => void;
  setLastError: (value: string | null) => void;
};

export type ConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

export const useUIStore = create<UIStore>((set) => ({
  state: defaultState(),
  connectionState: "connecting",
  lastError: null,
  setState: (state) => set({ state }),
  applyPatch: (operations) =>
    set((current) => {
      const nextState = cloneState(current.state);
      operations.forEach((operation) => applyOperation(nextState, operation));
      return { state: nextState };
    }),
  setConnectionState: (value) => set({ connectionState: value }),
  setLastError: (value) => set({ lastError: value }),
}));
