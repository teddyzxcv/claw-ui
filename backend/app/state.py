from __future__ import annotations

from copy import deepcopy
from threading import RLock
from typing import Any

from app.models import (
    AddWidgetOperation,
    AUIPMessage,
    MoveWidgetOperation,
    Operation,
    PatchUIMessage,
    RemoveWidgetOperation,
    SetLayoutOperation,
    SetUIMessage,
    TodoToggledEventPayload,
    UIEventMessage,
    UIState,
    UpdateWidgetOperation,
    View,
    ViewLayout,
    Widget,
    WidgetRemovedEventPayload,
)


class StateValidationError(ValueError):
    """Raised when an incoming patch would corrupt state."""


def default_state() -> dict[str, Any]:
    return {
        "views": {
            "main": {
                "layout": {
                    "columns": [
                        {"id": "col_1", "widget_ids": []},
                        {"id": "col_2", "widget_ids": []},
                    ]
                }
            }
        },
        "widgets": {},
    }


class UIStateStore:
    def __init__(self) -> None:
        self._lock = RLock()
        self._state = UIState.model_validate(default_state())

    def snapshot(self) -> UIState:
        with self._lock:
            return UIState.model_validate(self._state.model_dump())

    def set_state(self, new_state: UIState) -> UIState:
        with self._lock:
            self._validate_layout(new_state)
            self._state = UIState.model_validate(new_state.model_dump())
            return self.snapshot()

    def apply_auip(self, message: AUIPMessage) -> dict[str, Any]:
        if isinstance(message, SetUIMessage):
            state = self.set_state(message.payload.state)
            return self._set_ui_message(state, message.target.view_id)

        state = self.apply_patch(message)
        return {
            "protocol_version": message.protocol_version,
            "type": "patch_ui",
            "target": {"view_id": message.target.view_id},
            "payload": {"operations": self._operations_dump(message.payload.operations)},
        }

    def apply_patch(self, message: PatchUIMessage) -> UIState:
        view_id = message.target.view_id
        with self._lock:
            draft = UIState.model_validate(self._state.model_dump())

            if view_id not in draft.views:
                raise StateValidationError(f"Unknown view '{view_id}'.")

            for operation in message.payload.operations:
                self._apply_operation(draft, view_id, operation)

            self._validate_layout(draft)
            self._state = draft
            return self.snapshot()

    def apply_event(self, event_message: UIEventMessage) -> dict[str, Any]:
        payload = event_message.payload
        if isinstance(payload, WidgetRemovedEventPayload):
            operation = RemoveWidgetOperation(op="remove_widget", widget_id=payload.widget_id)
        elif isinstance(payload, TodoToggledEventPayload):
            operation = self._build_todo_toggle_operation(payload.widget_id, payload.item_id)
        else:
            raise StateValidationError(f"Unsupported event '{payload.event}'.")

        patch = PatchUIMessage(
            type="patch_ui",
            target={"view_id": "main"},
            payload={"operations": [operation]},
        )
        self.apply_patch(patch)
        return {
            "protocol_version": "1.0",
            "type": "patch_ui",
            "target": {"view_id": "main"},
            "payload": {"operations": self._operations_dump([operation])},
        }

    def _build_todo_toggle_operation(
        self, widget_id: str, item_id: str
    ) -> UpdateWidgetOperation:
        with self._lock:
            widget = self._state.widgets.get(widget_id)
            if widget is None:
                raise StateValidationError(f"Widget '{widget_id}' does not exist.")
            if (widget.kind, widget.variant) != ("productivity", "todo"):
                raise StateValidationError(
                    f"Widget '{widget_id}' is not a todo widget and cannot be toggled."
                )

            items = deepcopy(widget.config.get("items", []))
            found = False
            for item in items:
                if item.get("id") == item_id:
                    item["done"] = not bool(item.get("done"))
                    found = True
                    break

            if not found:
                raise StateValidationError(
                    f"Todo item '{item_id}' does not exist in widget '{widget_id}'."
                )

            return UpdateWidgetOperation(
                op="update_widget",
                widget_id=widget_id,
                changes={"config": {**widget.config, "items": items}},
            )

    def _apply_operation(self, state: UIState, view_id: str, operation: Operation) -> None:
        if isinstance(operation, AddWidgetOperation):
            self._add_widget(state, view_id, operation)
            return
        if isinstance(operation, RemoveWidgetOperation):
            self._remove_widget(state, view_id, operation.widget_id)
            return
        if isinstance(operation, MoveWidgetOperation):
            self._move_widget(state, view_id, operation)
            return
        if isinstance(operation, UpdateWidgetOperation):
            self._update_widget(state, operation)
            return
        if isinstance(operation, SetLayoutOperation):
            self._set_layout(state, view_id, operation.layout)
            return
        raise StateValidationError(f"Unsupported operation '{operation.op}'.")

    def _add_widget(self, state: UIState, view_id: str, operation: AddWidgetOperation) -> None:
        widget = operation.widget
        if widget.id in state.widgets:
            raise StateValidationError(f"Widget '{widget.id}' already exists.")

        column = self._find_column(state, view_id, operation.placement.column_id)
        position = min(operation.placement.position, len(column.widget_ids))
        column.widget_ids.insert(position, widget.id)
        state.widgets[widget.id] = widget

    def _remove_widget(self, state: UIState, view_id: str, widget_id: str) -> None:
        if widget_id not in state.widgets:
            raise StateValidationError(f"Widget '{widget_id}' does not exist.")

        del state.widgets[widget_id]
        for column in state.views[view_id].layout.columns:
            if widget_id in column.widget_ids:
                column.widget_ids.remove(widget_id)

    def _move_widget(self, state: UIState, view_id: str, operation: MoveWidgetOperation) -> None:
        if operation.widget_id not in state.widgets:
            raise StateValidationError(f"Widget '{operation.widget_id}' does not exist.")

        current_column = self._find_column_for_widget(state, view_id, operation.widget_id)
        target_column = self._find_column(state, view_id, operation.placement.column_id)

        current_column.widget_ids.remove(operation.widget_id)
        position = min(operation.placement.position, len(target_column.widget_ids))
        target_column.widget_ids.insert(position, operation.widget_id)

    def _update_widget(self, state: UIState, operation: UpdateWidgetOperation) -> None:
        existing = state.widgets.get(operation.widget_id)
        if existing is None:
            raise StateValidationError(f"Widget '{operation.widget_id}' does not exist.")

        merged = existing.model_dump()
        changes = operation.changes.model_dump(exclude_none=True)
        merged.update(changes)
        state.widgets[operation.widget_id] = Widget.model_validate(merged)

    def _set_layout(self, state: UIState, view_id: str, layout: ViewLayout) -> None:
        widget_ids = []
        for column in layout.columns:
            widget_ids.extend(column.widget_ids)

        if len(widget_ids) != len(set(widget_ids)):
            raise StateValidationError("Layout contains duplicate widget ids.")

        unknown_widgets = [widget_id for widget_id in widget_ids if widget_id not in state.widgets]
        if unknown_widgets:
            raise StateValidationError(
                f"Layout references unknown widgets: {', '.join(unknown_widgets)}."
            )

        state.views[view_id] = View(layout=layout)

    def _find_column(self, state: UIState, view_id: str, column_id: str):
        for column in state.views[view_id].layout.columns:
            if column.id == column_id:
                return column
        raise StateValidationError(f"Column '{column_id}' does not exist.")

    def _find_column_for_widget(self, state: UIState, view_id: str, widget_id: str):
        for column in state.views[view_id].layout.columns:
            if widget_id in column.widget_ids:
                return column
        raise StateValidationError(
            f"Widget '{widget_id}' is not placed in view '{view_id}'."
        )

    def _validate_layout(self, state: UIState) -> None:
        for view_id, view in state.views.items():
            widget_ids: list[str] = []
            for column in view.layout.columns:
                widget_ids.extend(column.widget_ids)

            if len(widget_ids) != len(set(widget_ids)):
                raise StateValidationError(
                    f"View '{view_id}' contains duplicate widget ids in layout."
                )

            unknown_widgets = [
                widget_id for widget_id in widget_ids if widget_id not in state.widgets
            ]
            if unknown_widgets:
                raise StateValidationError(
                    f"View '{view_id}' references unknown widgets: {', '.join(unknown_widgets)}."
                )

    def _operations_dump(self, operations: list[Operation]) -> list[dict[str, Any]]:
        return [operation.model_dump(mode="json", exclude_none=True) for operation in operations]

    def _set_ui_message(self, state: UIState, view_id: str) -> dict[str, Any]:
        return {
            "protocol_version": "1.0",
            "type": "set_ui",
            "target": {"view_id": view_id},
            "payload": {"state": state.model_dump(mode="json")},
        }


state_store = UIStateStore()
