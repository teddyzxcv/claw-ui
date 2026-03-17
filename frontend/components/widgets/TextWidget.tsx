import type { Widget } from "@/lib/types";

type TextWidgetProps = {
  widget: Widget;
};

export default function TextWidget({ widget }: TextWidgetProps) {
  const content = (widget.config.content as string | undefined) ?? "";

  return (
    <div className="rounded-xl border border-line bg-panelAlt p-4">
      <div className="whitespace-pre-wrap text-sm leading-7 text-secondary">
        {content || "No text content provided."}
      </div>
    </div>
  );
}
