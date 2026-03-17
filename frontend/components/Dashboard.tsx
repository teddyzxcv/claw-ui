"use client";

import { useMemo, useState } from "react";

import Layout from "@/components/Layout";
import { type ConnectionState, useUIStore } from "@/lib/store";
import { useRealtimeUI } from "@/lib/ws";

const connectionTone: Record<ConnectionState, string> = {
  connected: "border-moss/40 bg-moss/10 text-mist",
  connecting: "border-accent/40 bg-accent/10 text-mist",
  reconnecting: "border-ember/40 bg-ember/10 text-mist",
  offline: "border-white/10 bg-white/5 text-slate-300",
};

export default function Dashboard() {
  useRealtimeUI();

  const state = useUIStore((store) => store.state);
  const connectionState = useUIStore((store) => store.connectionState);
  const lastError = useUIStore((store) => store.lastError);
  const [selectedColumn, setSelectedColumn] = useState<string>("col_1");

  const totals = useMemo(() => {
    const widgetCount = Object.keys(state.widgets).length;
    const columns = state.views.main?.layout.columns ?? [];
    return {
      widgetCount,
      columnCount: columns.length,
      selectedCount:
        columns.find((column) => column.id === selectedColumn)?.widget_ids.length ?? 0,
    };
  }, [selectedColumn, state.widgets, state.views.main?.layout.columns]);

  const columns = state.views.main?.layout.columns ?? [];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="glass-panel stagger-in rounded-[28px] p-6 shadow-glow">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            Agent-Native UI
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Realtime dashboard runtime
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            The backend owns AUIP state, the client renders it, and every interaction
            returns to the gateway as a structured UI event.
          </p>

          <div
            className={`mt-6 inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.28em] ${connectionTone[connectionState]}`}
          >
            {connectionState}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Widgets
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {totals.widgetCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Columns
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {totals.columnCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Focus column
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {totals.selectedCount}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Inspect column
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {columns.map((column) => {
                const active = selectedColumn === column.id;
                return (
                  <button
                    key={column.id}
                    type="button"
                    onClick={() => setSelectedColumn(column.id)}
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      active
                        ? "border-accent bg-[var(--accent-soft)] text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {column.id}
                  </button>
                );
              })}
            </div>
          </div>

          {lastError ? (
            <div className="mt-8 rounded-2xl border border-ember/30 bg-ember/10 p-4 text-sm text-orange-100">
              {lastError}
            </div>
          ) : null}
        </section>

        <section className="stagger-in" style={{ animationDelay: "120ms" }}>
          <Layout />
        </section>
      </div>
    </main>
  );
}
