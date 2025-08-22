import React, { useEffect, useMemo, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  Call,
  CallControls,
  SpeakerLayout,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { getToken } from "./lib/getToken";

/**
 * Quick Start
 * 1) npm i @stream-io/video-react-sdk
 * 2) Replace API_KEY and TOKEN with values from your backend that creates Stream access tokens.
 *    - Never hardcode or mint tokens on the client in production.
 * 3) Drop <MeetingApp /> anywhere in your React app.
 *
 * Features covered by default CallControls: mic on/off, camera on/off, screen share, leave call.
 */

const API_KEY = import.meta?.env?.VITE_STREAM_API_KEY || "fy25ysphvp9x";


export default function App() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [callId, setCallId] = useState("");

  const client = useMemo(() => {
    if (!API_KEY || !token || !userId) return null;
    return new StreamVideoClient({
      apiKey: API_KEY,
      user: { id: userId, name: userName },
      token,
    });
  }, [token, userId, userName]);
  // Fetch token from server when userId changes
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const t = await getToken(userId);
        setToken(t);
      } catch (e) {
        setToken("");
        // Optionally handle error
      }
    })();
  }, [userId]);

  const [call, setCall] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      (async () => {
        try {
          await call?.leave();
        } catch (e) {
          // ignore
        }
      })();
    };
  }, [call]);

  const handleJoin = async (e) => {
    e?.preventDefault?.();
    if (!client || !callId) return;

    const _call = client.call("default", callId);
    await _call.join({
      create: true,
      audio: true,
      video: true,
    });
    setCall(_call);
    setJoined(true);
  };

  const handleLeave = async () => {
    try {
      await call?.leave();
    } finally {
      setJoined(false);
      setCall(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">GetStream Meeting App</h1>
          <a
            className="text-sm underline opacity-80 hover:opacity-100"
            href="https://getstream.io/video/"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </header>

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

            {/* Token is fetched automatically from the server. */}

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
                disabled={!token || !userId || !callId}
              >
                Join Call
              </button>
            </div>
          </form>
        )}

        {client && call && joined && (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamTheme>
                {/* Layout with active speaker focus; swap to <PaginatedGridLayout /> if you prefer grid */}
                <div className="rounded-2xl bg-white p-2 shadow">
                  <SpeakerLayout />
                </div>

                {/* Built-in controls include: mic toggle, camera toggle, screen share, device settings, leave call */}
                <div className="mt-3 rounded-2xl bg-white p-2 shadow">
                  <CallControls onLeave={handleLeave} />
                </div>
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
