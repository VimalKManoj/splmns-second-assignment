"use client";
import React, { useState, useEffect, useRef } from "react";
import { Turret_Road, Play } from "next/font/google";

import Link from "next/link";

const turretRoad = Turret_Road({
  variable: "--font-turret-road",
  weight: "700",
  subsets: ["latin"],
});
const play = Play({
  variable: "--font-play",
  weight: "400",
  subsets: ["latin"],
});

const COMPLETED_KEY = "completed_location";
// Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const REWARDS_KEY = "rewards";
const COOLDOWN_KEY = "lastCheckIn";
const STADIUM_LAT = 48.2188;
const STADIUM_LNG = 11.6247;
const COOLDOWN_MS = 60_000; // 1 minute

// Reward event type for local rewards
export interface RewardEvent {
  id: number;
  type: "check-in" | "video-watch" | "code-scan";
  earnedAt: string;
  description: string;
}

export default function LocationCheckIn() {
  const [distance, setDistance] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Load & tick cooldown every second
  useEffect(() => {
    const updateCooldown = () => {
      const last = parseInt(localStorage.getItem(COOLDOWN_KEY) || "0", 10);
      const elapsed = Date.now() - last;
      const rem = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldown(rem);
    };

    updateCooldown();
    intervalRef.current = window.setInterval(updateCooldown, 1000);
    return () => {
      if (intervalRef.current !== null)
        window.clearInterval(intervalRef.current);
    };
  }, []);

  // Save reward
  const saveReward = () => {
    const existing = JSON.parse(
      localStorage.getItem(REWARDS_KEY) || "[]"
    ) as RewardEvent[];
    existing.push({
      id: Date.now(),
      type: "check-in",
      earnedAt: new Date().toISOString(),
      description: "Checked in at Allianz Arena",
    });
    localStorage.setItem(REWARDS_KEY, JSON.stringify(existing));
  };

  // Unified check-in handler
  const doCheckIn = (lat: number, lng: number, isReal: boolean) => {
    const dist = calculateDistance(lat, lng, STADIUM_LAT, STADIUM_LNG);
    setDistance(dist);
    if (dist <= 50) {
      const now = Date.now().toString();
      localStorage.setItem(COOLDOWN_KEY, now);
      saveReward();
      setReward(true);
      setMessage(isReal ? "✅ Check‑in successful! " : "🛠 Simulated check‑in!");
      localStorage.setItem(COMPLETED_KEY, "1");
    } else {
      const km = (dist / 1000).toFixed(1);
      setMessage(
        `❌ The Sacred Arena lies ${km} km beyond your reach. Journey closer to claim your Shard.`
      );
    }
    setLoading(false);
  };

  // Real
  const handleCheckIn = () => {
    if (cooldown > 0) {
      setMessage(`⏳ Wait ${Math.ceil(cooldown / 1000)}s before trying again.`);
      return;
    }
    setLoading(true);
    if (!navigator.geolocation) {
      setMessage("⚠️ Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => doCheckIn(pos.coords.latitude, pos.coords.longitude, true),
      () => {
        setMessage("⚠️ Unable to get location");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Simulated
  const handleSimulateCheckIn = () => {
    if (cooldown > 0) {
      setMessage(
        `⏳ Wait ${Math.ceil(cooldown / 1000)}s before simulating again.`
      );
      return;
    }
    doCheckIn(STADIUM_LAT + 0.0001, STADIUM_LNG + 0.0001, false);
  };

  // Format ms → "MM:SS"
  const formatTimer = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `00:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div
      className={`h-screen w-full flex flex-col justify-center items-center gap-4 ${turretRoad.className}`}
    >
      <div className="p-10 border border-white/50 bg-black/20 backdrop-blur-md shadow-2xl">
        <h2 className={`text-xl font-bold mb-2 ${turretRoad.className}`}>
          Step into the Sacred Arena
        </h2>
        <p className={`mb-4 ${play.className}`}>
          Venture to the legendary battleground (Bayern Munich Stadium, Allianz
          Arena, Munich) and tap “Check In” to claim your Earth Shard.
        </p>

        <button
          onClick={handleCheckIn}
          disabled={loading || cooldown > 0}
          className="mr-2 px-4 py-2 border border-white/50 bg-gradient-to-b from-[#bb7ffd] to-[#171a46]/70 text-white hover:shadow-xl shadow-fuchsia-500 cursor-pointer transition-shadow"
        >
          {cooldown > 0
            ? `Wait ${formatTimer(cooldown)}`
            : loading
            ? "Checking…"
            : "Check In"}
        </button>
        {cooldown === 0 && (
          <button
            onClick={handleSimulateCheckIn}
            disabled={cooldown > 0}
            className="px-4 py-2 border border-white/50 bg-gradient-to-b from-[#27c5d6] to-[#245270] text-white hover:shadow-xl transition-shadow cursor-pointer shadow-cyan-500"
          >
            Simulate Check‑In
          </button>
        )}

        {distance !== null && (
          <>
            {" "}
            <p className="mt-4">Distance: {Math.round(distance)} meters</p>
            <p>{message}</p>
          </>
        )}

        {reward && (
          <div className="flex  gap-5 justify-between w-full items-center">
            <div>
              {/* {message && <p className="mt-2 text-lg">{message}</p>} */}
              <p>
                You’ve Uncovered a Shard. Return to your Wallet and Claim Your
                Reward
              </p>
            </div>

            <Link
              href={"/wallet"}
              className="bg-gradient-to-b from-[#bb7ffd] to-[#171a46]/70 text-white px-4 py-2  mr-2 cursor-pointer hover:shadow-xl transition-all duration-300 shadow-purple-300"
            >
              Go to Wallet
            </Link>
          </div>
        )}
      </div>

      {/* {reward && <RewardUnlocked setReward={setReward} />} */}
    </div>
  );
}
