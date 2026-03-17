"use client";

import { useEffect } from "react";

import Layout from "@/components/Layout";
import { type ConnectionState, useUIStore } from "@/lib/store";
import type { UIStateData } from "@/lib/types";
import { useRealtimeUI } from "@/lib/ws";

const STATUS_DOT: Record<ConnectionState, string> = {
  connected: "bg-moss shadow-[0_0_6px_var(--tw-shadow-color)] shadow-moss/60",
  connecting: "bg-accent animate-pulse",
  reconnecting: "bg-ember animate-pulse",
  offline: "bg-slate-500",
};

const STATUS_LABEL: Record<ConnectionState, string> = {
  connected: "Online",
  connecting: "Connecting\u2026",
  reconnecting: "Reconnecting\u2026",
  offline: "Offline",
};

type DashboardProps = {
  initialState: UIStateData;
};

export default function Dashboard({ initialState }: DashboardProps) {
  const setState = useUIStore((store) => store.setState);
  const liveState = useUIStore((store) => store.state);

  useEffect(() => {
    setState(initialState);
  }, [initialState, setState]);

  useRealtimeUI(initialState);

  const connectionState = useUIStore((store) => store.connectionState);
  const lastError = useUIStore((store) => store.lastError);
  const state = Object.keys(liveState.widgets).length > 0 ? liveState : initialState;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* ── Top bar ── */}
        <header className="stagger-in mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan-400">
              <svg className="h-3.5 w-3.5 text-[#08111d]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 15.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 13v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54A1.99 1.99 0 0 0 16 14h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V5h2c1.1 0 2-.9 2-2h.06A8.006 8.006 0 0 1 20 12c0 1.26-.3 2.45-.82 3.51l-.28-.12Z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white/80">OpenClaw</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[connectionState]}`} />
            <span className="text-xs text-slate-500">{STATUS_LABEL[connectionState]}</span>
          </div>
        </header>

        {lastError && (
          <div className="stagger-in mb-5 rounded-xl border border-ember/25 bg-ember/10 px-4 py-3 text-[13px] leading-5 text-orange-100">
            {lastError}
          </div>
        )}

        {/* ── Content ── */}
        <Layout state={state} />
      </div>
    </main>
  );
}
