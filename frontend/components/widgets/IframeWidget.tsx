"use client";

import type { CSSProperties, IframeHTMLAttributes } from "react";

import type { IframeConfig, Widget } from "@/lib/types";

type IframeWidgetProps = {
  widget: Widget;
};

const DEFAULT_HEIGHT = 320;
const REFERRER_POLICIES = new Set([
  "no-referrer",
  "no-referrer-when-downgrade",
  "origin",
  "origin-when-cross-origin",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url",
] satisfies NonNullable<IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"]>[]);

const normalizeDimension = (value: string | null): CSSProperties["height"] | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (/^\d+(\.\d+)?(px|%|vh|vw|rem)$/.test(trimmed)) {
    return trimmed;
  }

  return undefined;
};

const getIframeAttributeMap = (markup: string): Map<string, string> | null => {
  const match = markup.trim().match(/^<iframe\b([\s\S]*?)>\s*<\/iframe>\s*$/i);

  if (!match) {
    return null;
  }

  const attrs = new Map<string, string>();
  const attrPattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const attr of match[1].matchAll(attrPattern)) {
    const name = attr[1]?.toLowerCase();

    if (!name) {
      continue;
    }

    const value = attr[2] ?? attr[3] ?? attr[4] ?? "";
    attrs.set(name, value);
  }

  return attrs;
};

const normalizeReferrerPolicy = (
  value: string | null,
): IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"] | undefined => {
  if (!value) {
    return undefined;
  }

  return REFERRER_POLICIES.has(value as (typeof REFERRER_POLICIES extends Set<infer T> ? T : never))
    ? (value as IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"])
    : undefined;
};

const parseIframeMarkup = (
  markup: string,
): {
  props: IframeHTMLAttributes<HTMLIFrameElement>;
  height: CSSProperties["height"];
} | null => {
  const attrs = getIframeAttributeMap(markup);

  if (!attrs) {
    return null;
  }

  const title = attrs.get("title")?.trim() || "Embedded content";
  const src = attrs.get("src")?.trim() || undefined;
  const srcDoc = attrs.get("srcdoc") ?? undefined;
  const allow = attrs.get("allow") ?? undefined;
  const sandbox = attrs.get("sandbox") ?? undefined;
  const loading = attrs.get("loading") === "eager" ? "eager" : "lazy";
  const referrerPolicy = normalizeReferrerPolicy(attrs.get("referrerpolicy") ?? null);
  const height =
    normalizeDimension(attrs.get("height") ?? null) ??
    DEFAULT_HEIGHT;

  if (!src && !srcDoc) {
    return null;
  }

  return {
    props: {
      title,
      src,
      srcDoc,
      allow,
      sandbox,
      loading,
      referrerPolicy,
      allowFullScreen: attrs.has("allowfullscreen"),
    },
    height,
  };
};

export default function IframeWidget({ widget }: IframeWidgetProps) {
  const config = (widget.config as IframeConfig | undefined) ?? {};
  const parsed = config.iframe ? parseIframeMarkup(config.iframe) : null;

  if (!parsed) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panelAlt p-4 text-sm leading-6 text-quiet">
        Add a raw <code className="text-text">iframe</code> tag in <code className="text-text">config.iframe</code> to render custom content.
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-panelAlt">
      <iframe
        {...parsed.props}
        className="block w-full border-0 bg-white"
        style={{ height: parsed.height }}
      />
    </div>
  );
}
