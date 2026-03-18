from __future__ import annotations

from typing import Annotated, Any, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, model_validator


SUPPORTED_WIDGET_TYPES = {
    ("feed", "news"),
    ("info", "weather"),
    ("finance", "crypto"),
    ("productivity", "todo"),
    ("content", "text"),
    ("content", "iframe"),
}


class Placement(BaseModel):
    column_id: str
    position: int = Field(ge=0)


class Widget(BaseModel):
    id: str
    kind: str
    variant: str
    title: str
    config: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_widget_type(self) -> "Widget":
        if (self.kind, self.variant) not in SUPPORTED_WIDGET_TYPES:
            raise ValueError(
                f"Unsupported widget type '{self.kind}:{self.variant}'."
            )
        return self


class WidgetChanges(BaseModel):
    title: Optional[str] = None
    kind: Optional[str] = None
    variant: Optional[str] = None
    config: Optional[dict[str, Any]] = None

    model_config = ConfigDict(extra="forbid")


class ColumnLayout(BaseModel):
    id: str
    widget_ids: list[str] = Field(default_factory=list)


class ViewLayout(BaseModel):
    columns: list[ColumnLayout] = Field(default_factory=list, min_length=1)


class View(BaseModel):
    layout: ViewLayout


class UIState(BaseModel):
    views: dict[str, View]
    widgets: dict[str, Widget]


class Target(BaseModel):
    view_id: str = "main"


class AddWidgetOperation(BaseModel):
    op: Literal["add_widget"]
    widget: Widget
    placement: Placement


class RemoveWidgetOperation(BaseModel):
    op: Literal["remove_widget"]
    widget_id: str


class MoveWidgetOperation(BaseModel):
    op: Literal["move_widget"]
    widget_id: str
    placement: Placement


class UpdateWidgetOperation(BaseModel):
    op: Literal["update_widget"]
    widget_id: str
    changes: WidgetChanges


class SetLayoutOperation(BaseModel):
    op: Literal["set_layout"]
    layout: ViewLayout


Operation = Annotated[
    Union[
        AddWidgetOperation,
        RemoveWidgetOperation,
        MoveWidgetOperation,
        UpdateWidgetOperation,
        SetLayoutOperation,
    ],
    Field(discriminator="op"),
]


class SetUIPayload(BaseModel):
    state: UIState


class PatchUIPayload(BaseModel):
    operations: list[Operation] = Field(default_factory=list, max_length=20)


class SetUIMessage(BaseModel):
    protocol_version: Literal["1.0"] = "1.0"
    type: Literal["set_ui"]
    target: Target = Field(default_factory=Target)
    payload: SetUIPayload


class PatchUIMessage(BaseModel):
    protocol_version: Literal["1.0"] = "1.0"
    type: Literal["patch_ui"]
    target: Target = Field(default_factory=Target)
    payload: PatchUIPayload


AUIPMessage = Annotated[Union[SetUIMessage, PatchUIMessage], Field(discriminator="type")]


class WidgetRemovedEventPayload(BaseModel):
    event: Literal["widget_removed"]
    widget_id: str


class TodoToggledEventPayload(BaseModel):
    event: Literal["todo_toggled"]
    widget_id: str
    item_id: str


UIEventPayload = Annotated[
    Union[WidgetRemovedEventPayload, TodoToggledEventPayload],
    Field(discriminator="event"),
]


class UIEventMessage(BaseModel):
    type: Literal["ui_event"] = "ui_event"
    payload: UIEventPayload
