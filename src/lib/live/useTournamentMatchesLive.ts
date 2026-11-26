"use client";

import { useEffect, useRef, useState } from "react";
import type { Match } from "@/lib/types";
import { DEFAULT_CLUB_SLUG } from "@/lib/club/tenant";
import {
  organizerTournamentMatchesEventsPath,
  parseLiveSyncJSON,
  syncOrganizerTournamentMatches,
  syncTournamentMatches,
  tournamentMatchesEventsPath,
  type MatchLiveSync,
} from "@/lib/api/matches";

export type LiveConnectionMode = "sse" | "poll" | "idle";

type LiveSource =
  | { kind: "public"; slug: string; clubSlug?: string }
  | { kind: "organizer"; tournamentId: string };

type Options = {
  initialMatches: Match[];
  enabled?: boolean;
  /** Skip applying remote snapshots while true (e.g. score editor open). */
  pauseApply?: boolean;
  pollMs?: number;
};

function withClubQuery(url: string, clubSlug?: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}club=${encodeURIComponent(clubSlug || DEFAULT_CLUB_SLUG)}`;
}

/**
 * Live tournament match list: prefer SSE, fall back to revision polling.
 * Pauses network apply when the tab is hidden; optional pauseApply for editors.
 */
export function useTournamentMatchesLive(source: LiveSource, options: Options) {
  const {
    initialMatches,
    enabled = true,
    pauseApply = false,
    pollMs = 3500,
  } = options;

  const [matches, setMatches] = useState(initialMatches);
  const [revision, setRevision] = useState("");
  const [tournamentStatus, setTournamentStatus] = useState("");
  const [mode, setMode] = useState<LiveConnectionMode>("idle");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const revisionRef = useRef(revision);
  const pauseRef = useRef(pauseApply);
  revisionRef.current = revision;
  pauseRef.current = pauseApply;

  const sourceKey =
    source.kind === "public"
      ? `public:${source.slug}:${source.clubSlug ?? ""}`
      : `organizer:${source.tournamentId}`;

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    pauseRef.current = pauseApply;
  }, [pauseApply]);

  useEffect(() => {
    if (!enabled) {
      setMode("idle");
      return;
    }

    let cancelled = false;
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let usingPoll = false;

    const ingest = (sync: MatchLiveSync) => {
      if (cancelled) return;
      if (sync.revision) {
        revisionRef.current = sync.revision;
        setRevision(sync.revision);
      }
      if (sync.tournamentStatus) setTournamentStatus(sync.tournamentStatus);
      if (pauseRef.current || sync.unchanged || !sync.matches) return;
      setMatches(sync.matches);
      setUpdatedAt(Date.now());
    };

    const pollOnce = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      try {
        const sync =
          source.kind === "public"
            ? await syncTournamentMatches(source.slug, revisionRef.current || undefined, {
                clubSlug: source.clubSlug,
              })
            : await syncOrganizerTournamentMatches(
                source.tournamentId,
                revisionRef.current || undefined,
              );
        ingest(sync);
      } catch {
        // Keep last good snapshot; next tick retries.
      }
    };

    const startPolling = () => {
      if (cancelled || pollTimer) return;
      usingPoll = true;
      setMode("poll");
      void pollOnce();
      pollTimer = setInterval(() => {
        void pollOnce();
      }, pollMs);
    };

    const startSSE = () => {
      if (typeof EventSource === "undefined") {
        startPolling();
        return;
      }
      const path =
        source.kind === "public"
          ? tournamentMatchesEventsPath(source.slug)
          : organizerTournamentMatchesEventsPath(source.tournamentId);
      try {
        es = new EventSource(
          withClubQuery(path, source.kind === "public" ? source.clubSlug : undefined),
          { withCredentials: true },
        );
      } catch {
        startPolling();
        return;
      }

      const onPayload = (event: MessageEvent<string>) => {
        try {
          ingest(parseLiveSyncJSON(event.data));
        } catch {
          // ignore malformed frames
        }
      };

      es.addEventListener("snapshot", onPayload as EventListener);
      es.addEventListener("update", onPayload as EventListener);
      es.addEventListener("reconnect", () => {
        es?.close();
        es = null;
        startPolling();
      });
      es.onopen = () => {
        if (!cancelled && !usingPoll) setMode("sse");
      };
      es.onerror = () => {
        es?.close();
        es = null;
        if (!cancelled) startPolling();
      };
    };

    startSSE();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && usingPoll) {
        void pollOnce();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      es?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
    // sourceKey captures slug / tournamentId; source.kind is part of the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable sourceKey
  }, [enabled, pollMs, sourceKey]);

  return {
    matches,
    setMatches,
    revision,
    tournamentStatus,
    mode,
    updatedAt,
  };
}
