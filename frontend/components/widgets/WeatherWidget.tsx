import type { WeatherConfig, Widget } from "@/lib/types";

type WeatherWidgetProps = {
  widget: Widget;
};

export default function WeatherWidget({ widget }: WeatherWidgetProps) {
  const config = (widget.config as WeatherConfig | undefined) ?? {};

  return (
    <div className="rounded-xl border border-line bg-panelAlt p-4">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-quiet">
        {config.location ?? "Unknown location"}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-5xl font-medium text-text">
            {config.temp_c ?? "--"}
            <span className="text-xl text-secondary">C</span>
          </div>
          <p className="mt-2 text-sm text-secondary">{config.condition ?? "No forecast"}</p>
        </div>
        <div className="rounded-xl border border-line bg-shell px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-quiet">Range</p>
          <p className="mt-2 text-sm text-text">
            H {config.high_c ?? "--"}C / L {config.low_c ?? "--"}C
          </p>
        </div>
      </div>
    </div>
  );
}
