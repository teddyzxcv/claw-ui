"use client";

import { useEffect, useRef } from "react";

import { useUIStore } from "@/lib/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

const POLL_INTERVAL_MS = 1000;

export const postUIEvent = async (payload: unknown) => {
  const response = await fetch(`${API_BASE_URL}/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`UI event failed with ${response.status}.`);
  }

  return response.json();
};

export const useRealtimeUI = () => {
  const setState = useUIStore((store) => store.setState);
  const setConnectionState = useUIStore((store) => store.setConnectionState);
  const setLastError = useUIStore((store) => store.setLastError);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/state`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`State request failed with ${response.status}.`);
        }

        const state = await response.json();
        if (!active) {
          return;
        }

        setState(state);
        setConnectionState("connected");
        setLastError(null);
      } catch (error) {
        if (!active) {
          return;
        }
        setConnectionState("reconnecting");
        setLastError(
          error instanceof Error ? error.message : "Failed to sync dashboard state.",
        );
      } finally {
        if (active) {
          refreshTimerRef.current = window.setTimeout(sync, POLL_INTERVAL_MS);
        }
      }
    };

    setConnectionState("connecting");
    void sync();

    return () => {
      active = false;
      setConnectionState("offline");
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [setConnectionState, setLastError, setState]);
};
