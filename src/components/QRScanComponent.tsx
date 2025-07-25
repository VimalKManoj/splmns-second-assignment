"use client";

import React, { useState, useEffect, useRef } from "react";
import { Turret_Road, Play } from "next/font/google";

import Link from "next/link";
import { RewardEvent } from "./LocationCheckinComponent";

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

const REWARDS_KEY = "rewards";
const COOLDOWN_KEY = "lastCodeScan";
const COMPLETED_KEY = "completed_code";
const COOLDOWN_MS = 60_000; // 1 minute

function saveReward() {
  const existing = JSON.parse(
    localStorage.getItem(REWARDS_KEY) || "[]"
  ) as RewardEvent[];
  existing.push({
    id: Date.now(),
    type: "code-scan",
    earnedAt: new Date().toISOString(),
    description: "Scanned QR and entered secret code",
  });
  localStorage.setItem(REWARDS_KEY, JSON.stringify(existing));
}

export default function CodeScanner() {
  const [secret] = useState(() =>
    Math.random().toString(36).slice(2, 10).toUpperCase()
  );
  const [inputCode, setInputCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Tick the cooldown every second
  useEffect(() => {
    const tick = () => {
      const last = parseInt(localStorage.getItem(COOLDOWN_KEY) || "0", 10);
      const elapsed = Date.now() - last;
      const rem = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldown(rem);
      // if cooldown just expired, reset unlocked & message
      if (rem === 0 && unlocked) {
        setUnlocked(false);
        setMessage("");
        setInputCode("");
      }
    };
    tick();
    intervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (intervalRef.current !== null)
        window.clearInterval(intervalRef.current);
    };
  }, [unlocked]);

  // Format ms → "MM:SS"
  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `00:${s < 10 ? "0" + s : s}`;
  };

  const handleUnlock = () => {
    if (unlocked || cooldown > 0) return;
    if (inputCode.trim().toUpperCase() === secret) {
      saveReward();
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      setUnlocked(true);
      localStorage.setItem(COMPLETED_KEY, "1");
      setMessage(
        "Congratulations, Explorer! You’ve Uncovered a Shard.Return to your Wallet and Claim Your Reward"
      );
    } else {
      setMessage("❌ Incorrect code. Please try again.");
    }
  };

  const handleGetSecret = () => {
    if (unlocked || cooldown > 0) return;
    setInputCode(secret);
    navigator.clipboard.writeText(secret);
    setMessage("📋 Secret copied to input & clipboard.");
  };

  return (
    <div
      className={`max-w-md mx-auto py-6 px-8 border border-white/50 backdrop-blur-sm space-y-6 z-40 ${play.className}`}
    >
      <h2
        className={`text-2xl font-semibold text-center ${turretRoad.className}`}
      >
        Decode the Arcane Sigil
      </h2>

      {/* QR */}
      <div className="text-center">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
            secret
          )}`}
          alt="Secret QR Code"
          className="mx-auto mb-2"
        />
        <p className={`text-sm ${play.className}`}>
          Point your phone camera at this QR to read the secret code.
        </p>
      </div>

      {/* Fallback button */}
      <div className="text-center">
        <button
          onClick={handleGetSecret}
          disabled={unlocked || cooldown > 0}
          className="px-4 py-2  hover:bg-[#9e7ad2]   bg-gradient-to-b from-[#bb7ffd] to-[#171a46]/70 text-white hover:shadow-xl shadow-fuchsia-500 cursor-pointer transition-shadow"
        >
          {cooldown > 0
            ? `Wait ${fmt(cooldown)}`
            : "Unable to scan? Get secret"}
        </button>
      </div>

      {/* Input + Unlock */}
      <div>
        <label
          htmlFor="code-input"
          className={`block text-sm font-medium text-white mb-1`}
        >
          Enter Secret Code
        </label>
        <div className="flex gap-2">
          <input
            id="code-input"
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            disabled={unlocked || cooldown > 0}
            placeholder="Paste or type code here"
            className="flex-grow border border-white/60 px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[#ad90d6]"
          />
          <button
            onClick={handleUnlock}
            disabled={unlocked || cooldown > 0}
            className={`px-4 py-2  text-white ${
              unlocked
                ? "bg-cyan-400"
                : "bg-gradient-to-b from-[#27c5d6] to-[#245270] text-white hover:bg-[#5b1ad9]  hover:shadow-xl transition-shadow cursor-pointer shadow-cyan-500"
            } disabled:opacity-50 transition`}
          >
            {unlocked
              ? "Unlocked"
              : cooldown > 0
              ? `Wait ${fmt(cooldown)}`
              : "Unlock"}
          </button>
        </div>
      </div>

      {message && (
        <div className="flex flex-col gap-2 justify-center items-center">
          <p
            className={`text-center text-sm ${
              unlocked ? "text-white" : "text-white"
            }`}
          >
            {message}
          </p>
          {unlocked && (
            <Link
              href={"/wallet"}
              className="bg-gradient-to-b  from-[#bb7ffd] to-[#171a46]/70 text-white px-4 py-2  mr-2 cursor-pointer hover:shadow-xl transition-all duration-300 shadow-purple-300"
            >
              Go to Wallet
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
