"use client";

import { useEffect } from "react";

import Layout from "@/components/Layout";
import { type ConnectionState, useUIStore } from "@/lib/store";
import type { UIStateData } from "@/lib/types";
import { useRealtimeUI } from "@/lib/ws";

const STATUS_TONE: Record<ConnectionState, string> = {
  connected: "text-quiet",
  connecting: "text-coralMid",
  reconnecting: "text-coral",
  offline: "text-coralDark",
};

const STATUS_LABEL: Record<ConnectionState, string> = {
  connected: "idle",
  connecting: "thinking",
  reconnecting: "updating",
  offline: "error",
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
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="pointer-events-none fixed right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8">
          <section className="agent-surface glass-panel stagger-in pointer-events-auto min-w-[160px] max-w-[320px] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm leading-none">🧠</span>
              <span className="text-sm text-text">OpenClaw</span>
              <span className={`text-[11px] uppercase tracking-[0.18em] ${STATUS_TONE[connectionState]}`}>
                {STATUS_LABEL[connectionState]}
              </span>
            </div>
            {lastError ? (
              <p className="mt-2 text-xs leading-5 text-secondary">{lastError}</p>
            ) : null}
          </section>
        </div>

        <Layout state={state} />
      </div>
    </main>
  );
}
