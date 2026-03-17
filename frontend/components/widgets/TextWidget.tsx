import type { Widget } from "@/lib/types";

type TextWidgetProps = {
  widget: Widget;
};

export default function TextWidget({ widget }: TextWidgetProps) {
  const content = (widget.config.content as string | undefined) ?? "";

  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
      <div className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
        {content || "No text content provided."}
      </div>
    </div>
  );
}
