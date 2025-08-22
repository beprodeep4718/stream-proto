import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { getToken } from "./lib/getToken";

const API_KEY = import.meta?.env?.VITE_STREAM_API_KEY || "fy25ysphvp9x";

export default function App() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [callId, setCallId] = useState("");
  const [call, setCall] = useState(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const client = useMemo(() => {
    if (!API_KEY || !token || !userId) return null;
    return new StreamVideoClient({
      apiKey: API_KEY,
      user: { id: userId, name: userName },
      token,
    });
  }, [token, userId, userName]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const t = await getToken(userId);
        if (!cancelled) setToken(t);
      } catch (e) {
        if (!cancelled) {
          setToken("");
          setError("Failed to fetch token. Please try again.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          await call?.leave();
        } catch {}
      })();
    };
  }, [call]);

  const handleJoin = useCallback(async (e) => {
    e?.preventDefault?.();
    if (!client || !callId || loading) return;
    setLoading(true);
    setError("");
    try {
      const _call = client.call("default", callId);
      await _call.join({ create: true, audio: true, video: true });
      setCall(_call);
      setJoined(true);
    } catch (err) {
      setError("Failed to join call. Please check your details.");
    } finally {
      setLoading(false);
    }
  }, [client, callId, loading]);

  const handleLeave = useCallback(async () => {
    try {
      await call?.leave();
    } finally {
      setJoined(false);
      setCall(null);
      setUserName("");
      setCallId("");
      setUserId("");
    }
  }, [call]);

  return (
    <div className="h-screen w-full bg-gray-50 text-gray-900">
      <div className="mx-auto p-4">
        {/* <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">GetStream Meeting App</h1>
          <a
            className="text-sm underline opacity-80 hover:opacity-100"
            href="https://getstream.io/video/"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </header> */}

        {!joined && (
          <form
            onSubmit={handleJoin}
            className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow"
          >
            <div className="grid gap-1">
              <label className="text-sm">User ID</label>
              <input
                className="rounded-xl border px-3 py-2"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm">User Name</label>
              <input
                className="rounded-xl border px-3 py-2"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm">Call ID</label>
              <input
                className="rounded-xl border px-3 py-2"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                required
              />
              <p className="text-xs opacity-70">Share this Call ID with others to join the same room.</p>
            </div>

            {error && (
              <div className="text-xs text-red-600">{error}</div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 flex items-center justify-center"
                disabled={!token || !userId || !callId || loading}
              >
                {loading ? (
                  <span>
                    <svg className="inline mr-2 w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  "Join Call"
                )}
              </button>
            </div>
          </form>
        )}

        {client && call && joined && (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamTheme>
                  <SpeakerLayout />
                  <CallControls onLeave={handleLeave} />
              </StreamTheme>
            </StreamCall>
          </StreamVideo>
        )}

        {client && !joined && (
          <div className="rounded-2xl bg-yellow-50 p-4 text-sm">
            Fill the form above and click <strong>Join Call</strong> to start.
          </div>
        )}
      </div>
    </div>
  );
}
