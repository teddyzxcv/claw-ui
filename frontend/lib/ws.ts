"use client";

import { useEffect, useRef } from "react";

import { useUIStore } from "@/lib/store";
import type { UIMessage } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  API_BASE_URL.replace(/^http/i, "ws").replace(/\/$/, "") + "/ws";

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
  const applyPatch = useUIStore((store) => store.applyPatch);
  const setConnectionState = useUIStore((store) => store.setConnectionState);
  const setLastError = useUIStore((store) => store.setLastError);
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;

    const fetchInitialState = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/state`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`State request failed with ${response.status}.`);
        }
        const state = await response.json();
        if (active) {
          setState(state);
        }
      } catch (error) {
        if (active) {
          setLastError(error instanceof Error ? error.message : "Failed to load state.");
        }
      }
    };

    const connect = () => {
      setConnectionState(retryRef.current === 0 ? "connecting" : "reconnecting");
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        retryRef.current = 0;
        setConnectionState("connected");
        setLastError(null);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as UIMessage;
        if (message.type === "set_ui") {
          setState(message.payload.state);
          return;
        }

        if (message.type === "patch_ui") {
          applyPatch(message.payload.operations);
        }
      };

      socket.onerror = () => {
        setLastError("WebSocket connection encountered an error.");
      };

      socket.onclose = () => {
        if (!active) {
          return;
        }
        setConnectionState("reconnecting");
        retryRef.current += 1;
        const timeout = Math.min(1000 * 2 ** retryRef.current, 10000);
        reconnectTimerRef.current = window.setTimeout(connect, timeout);
      };
    };

    void fetchInitialState();
    connect();

    return () => {
      active = false;
      setConnectionState("offline");
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
    };
  }, [applyPatch, setConnectionState, setLastError, setState]);
};
