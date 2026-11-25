"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* Web Speech API wrapper. Not every browser has it, so callers always offer typing. */

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

export function useSpeech(onFinal: (text: string) => void) {
  // false on the server, real value in the browser, without a hydration mismatch
  const supported = useSyncExternalStore(noopSubscribe, () => getRecognition() !== null, () => false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-NG";
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        if (r.isFinal) onFinalRef.current(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Microphone access was blocked. You can type instead." : "Couldn't hear that. Try again or type instead.");
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    ref.current = rec;
    return () => rec.stop();
  }, []);

  const start = useCallback(() => {
    setError(null);
    try {
      ref.current?.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => ref.current?.stop(), []);

  return { supported, listening, interim, error, start, stop };
}
