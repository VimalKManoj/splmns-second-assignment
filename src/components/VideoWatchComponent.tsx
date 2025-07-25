"use client";
import React, { useRef, useState, useEffect } from "react";
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

// storage keys
const REWARDS_KEY = "rewards";
const VIDEO_COOLDOWN_KEY = "lastVideoWatch";
const COMPLETED_KEY = "completed_video";
const COOLDOWN_MS = 60_000; // 1 minute

function saveReward() {
  const existing = JSON.parse(
    localStorage.getItem(REWARDS_KEY) || "[]"
  ) as RewardEvent[];
  existing.push({
    id: Date.now(),
    type: "video-watch",
    earnedAt: new Date().toISOString(),
    description: "Watched 15 seconds of video",
  });
  localStorage.setItem(REWARDS_KEY, JSON.stringify(existing));
}

export default function VideoWatcher() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rewarded, setRewarded] = useState(false);
  const [message, setMessage] = useState("");
  const [lastTime, setLastTime] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Update cooldown every second
  useEffect(() => {
    const update = () => {
      const last = parseInt(
        localStorage.getItem(VIDEO_COOLDOWN_KEY) || "0",
        10
      );
      const elapsed = Date.now() - last;
      const rem = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldown(rem);
    };
    update();
    const iv = window.setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // Handle time updates
  const handleTimeUpdate = () => {
    if (cooldown > 0 || rewarded) return;
    const vid = videoRef.current;
    if (!vid) return;
    const current = vid.currentTime;
    if (current > lastTime) setLastTime(current);
    if (current >= 15) {
      // Reward
      saveReward();
      setRewarded(true);
      setMessage(
        " Congrats! You’ve unlocked a new Elemental Shard. Head back to your vault to collect it."
      );
      localStorage.setItem(COMPLETED_KEY, "1");
      // start cooldown
      localStorage.setItem(VIDEO_COOLDOWN_KEY, Date.now().toString());
    }
  };

  // Prevent seeking ahead
  const handleSeeking = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.currentTime > lastTime && lastTime < 15) {
      vid.currentTime = lastTime;
      setMessage("⏳ Finish watching naturally to earn the reward.");
    }
  };

  // Format mm:ss
  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `00:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className="p-10 border border-white/50 max-w-md mx-auto z-40 backdrop-blur-sm">
      <h2 className={`text-xl font-bold mb-2 ${turretRoad.className}`}>
        📽️ Watch the Arcane Chronicle
      </h2>
      <p className={`mb-4 ${play.className}`}>
        Immerse yourself in{" "}
        <span className="text-xl text-white">15 seconds</span> of enchanted
        footage to claim your next Elemental Shard.
      </p>

      <div className="relative">
        <video
          ref={videoRef}
          src="/one.mp4"
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          className="w-full mb-4"
          // disable controls during cooldown
          controls={!rewarded && cooldown === 0}
        />

        {cooldown > 0 && !rewarded && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-lg">
            ⏳ Ready in {fmt(cooldown)}
          </div>
        )}
      </div>

      {message && (
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className={`mt-2  ${turretRoad.className} text-center`}>
            {message}
          </p>
          {rewarded && (
            <Link
              href={"/wallet"}
              className="bg-gradient-to-b from-[#bb7ffd] to-[#171a46]/70 text-white px-4 py-2  mr-2 cursor-pointer hover:shadow-xl transition-all duration-300 shadow-purple-300"
            >
              Go to Wallet
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
