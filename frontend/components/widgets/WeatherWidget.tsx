import type { WeatherConfig, Widget } from "@/lib/types";

type WeatherWidgetProps = {
  widget: Widget;
};

export default function WeatherWidget({ widget }: WeatherWidgetProps) {
  const config = (widget.config as WeatherConfig | undefined) ?? {};

  return (
    <div
      className="rounded-[22px] p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(106, 227, 255, 0.14), rgba(255, 255, 255, 0.04) 52%, rgba(255, 255, 255, 0.02))",
      }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
        {config.location ?? "Unknown location"}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-5xl font-semibold text-white">
            {config.temp_c ?? "--"}
            <span className="text-xl text-slate-300">C</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{config.condition ?? "No forecast"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Range</p>
          <p className="mt-2 text-sm text-white">
            H {config.high_c ?? "--"}C / L {config.low_c ?? "--"}C
          </p>
        </div>
      </div>
    </div>
  );
}
