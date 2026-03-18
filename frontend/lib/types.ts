export type WidgetKey =
  | "feed:news"
  | "info:weather"
  | "finance:crypto"
  | "productivity:todo"
  | "content:text"
  | "content:iframe";

export type Widget = {
  id: string;
  kind: string;
  variant: string;
  title: string;
  config: Record<string, unknown>;
};

export type ColumnLayout = {
  id: string;
  widget_ids: string[];
};

export type ViewLayout = {
  columns: ColumnLayout[];
};

export type View = {
  layout: ViewLayout;
};

export type UIStateData = {
  views: Record<string, View>;
  widgets: Record<string, Widget>;
};

export type Placement = {
  column_id: string;
  position: number;
};

export type AddWidgetOperation = {
  op: "add_widget";
  widget: Widget;
  placement: Placement;
};

export type RemoveWidgetOperation = {
  op: "remove_widget";
  widget_id: string;
};

export type MoveWidgetOperation = {
  op: "move_widget";
  widget_id: string;
  placement: Placement;
};

export type UpdateWidgetOperation = {
  op: "update_widget";
  widget_id: string;
  changes: Partial<Pick<Widget, "title" | "kind" | "variant" | "config">>;
};

export type SetLayoutOperation = {
  op: "set_layout";
  layout: ViewLayout;
};

export type Operation =
  | AddWidgetOperation
  | RemoveWidgetOperation
  | MoveWidgetOperation
  | UpdateWidgetOperation
  | SetLayoutOperation;

export type SetUIMessage = {
  protocol_version: "1.0";
  type: "set_ui";
  target: {
    view_id: string;
  };
  payload: {
    state: UIStateData;
  };
};

export type PatchUIMessage = {
  protocol_version: "1.0";
  type: "patch_ui";
  target: {
    view_id: string;
  };
  payload: {
    operations: Operation[];
  };
};

export type UIMessage = SetUIMessage | PatchUIMessage;

export type WidgetRemovedEvent = {
  type: "ui_event";
  payload: {
    event: "widget_removed";
    widget_id: string;
  };
};

export type TodoToggledEvent = {
  type: "ui_event";
  payload: {
    event: "todo_toggled";
    widget_id: string;
    item_id: string;
  };
};

export type UIEvent = WidgetRemovedEvent | TodoToggledEvent;

export type NewsItem = {
  title: string;
  summary?: string;
  url?: string;
  source?: string;
};

export type WeatherConfig = {
  location?: string;
  temp_c?: number;
  condition?: string;
  high_c?: number;
  low_c?: number;
};

export type CryptoItem = {
  symbol: string;
  name?: string;
  price: number;
  change_24h?: number;
};

export type TodoItem = {
  id: string;
  label: string;
  done?: boolean;
};

export type IframeConfig = {
  iframe?: string;
};
