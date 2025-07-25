"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Turret_Road } from "next/font/google";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Play } from "next/font/google";

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

// Avatar icons
const AVATAR_ICONS = [
  "/avatar-one.png",
  "/avatar-two.png",
  "/avatar-three.png",
  "/avatar-four.png",
];

// Reward event & shard types
interface RewardEvent {
  id: string;
  type: "check-in" | "video-watch" | "code-scan";
  timestamp: string;
}
export type Shard = "Earth" | "Water" | "Fire";

// Available shards
const ELEMENTS: Shard[] = ["Earth", "Water", "Fire"];

// Pick a random shard
function randomShard(): Shard {
  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
}

export default function WalletComponent({
  onDrop,
}: {
  onDrop: (shard: Shard) => void;
}) {
  // ——————————————————————————————
  // State: pending & collected
  // ——————————————————————————————
  const [pending, setPending] = useLocalStorage<RewardEvent[]>("rewards", []);
  const [shards, setShards] = useLocalStorage<Shard[]>("shards", []);

  // Count pending by type
  const counts = pending.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  // Count collected shards
  const shardCounts = shards.reduce<Record<Shard, number>>((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<Shard, number>);

  // ——————————————————————————————
  // Handlers: collect shard & reset
  // ——————————————————————————————
  const collectShard = (type: RewardEvent["type"]) => {
    const idx = pending.findIndex((r) => r.type === type);
    if (idx < 0) return;

    const newPending = [...pending];
    newPending.splice(idx, 1);
    setPending(newPending);

    const s = randomShard();
    setShards([...shards, s]);

    onDrop(s);
    new Audio("/unlocked.mp3")
      .play()
      .catch((e) => console.warn("Audio failed:", e));
  };

  const resetAll = () => {
    setPending([]);
    setShards([]);
    localStorage.removeItem("lastCheckIn");
    localStorage.removeItem("lastVideoWatch");
    localStorage.removeItem("lastCodeScan");
  };

  // ——————————————————————————————
  // State: avatar name & icon
  // ——————————————————————————————
  const [avatarName, setAvatarName] = useState("");
  const [avatarIcon, setAvatarIcon] = useState(AVATAR_ICONS[0]);

  useEffect(() => {
    const n = localStorage.getItem("avatar_name");
    const i = localStorage.getItem("avatar_icon");
    if (n) setAvatarName(n);
    if (i) setAvatarIcon(i);
  }, []);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarName(e.target.value);
    localStorage.setItem("avatar_name", e.target.value);
  };

  const onIconSelect = (src: string) => {
    setAvatarIcon(src);
    localStorage.setItem("avatar_icon", src);
  };

  // ——————————————————————————————
  // GSAP animations
  // ——————————————————————————————
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const glares = gsap.utils.toArray<HTMLElement>(".glare");
      glares.forEach((glare) => {
        gsap.to(glare, {
          scale: () => gsap.utils.random(0.3, 1, 0.1),
          rotate: 360,
          duration: () => gsap.utils.random(5, 6),
          ease: "power2.out",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        });
      });

      gsap.to(".elm", {
        y: 50,
        duration: 3,
        ease: "power2.out",
        repeat: -1,
        yoyo: true,
      });
    },
    {
      scope: container,
      dependencies: [shards.length],
    }
  );

  return (
    <div
      className={`p-6 max-w-7xl mx-auto pt-28 w-full h-screen  z-40 flex flex-col gap-10 relative ${play.className}`}
      ref={container}
    >
      <div className="flex justify-between items-center">
        <h2
          className={`text-2xl font-semibold flex items-center gap-2 ${turretRoad.className}`}
        >
          Your Wallet —{" "}
          <Image
            src={avatarIcon}
            alt="avatar"
            width={80}
            height={80}
            className="rounded-full border-2  ml-2"
          />
          <span className="ml-1 text-white">{avatarName || "Adventurer"}</span>
        </h2>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-gradient-to-b  from-red-500 to-red-950 text-white cursor-pointer hover:shadow-xl transition-shadow shadow-red-500"
        >
          Reset All Rewards
        </button>
      </div>
      <div className="flex w-full gap-10">
        {/* Pending Rewards */}
        <div className="flex-1 flex flex-col w-full gap-10">
          {/* Avatar Editor */}
          <div className="p-4 bg-black/20 backdrop-blur-sm border border-white/50 flex flex-col md:flex-row items-center gap-6">
            {/* Name Input */}
            <div>
              <label className="block text-white mb-1">Avatar Name</label>
              <input
                type="text"
                value={avatarName}
                onChange={onNameChange}
                placeholder="Enter name"
                className="px-3 py-2 rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {/* Icon Selector */}
            <div className="flex gap-3">
              {AVATAR_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => onIconSelect(icon)}
                  className={`p-1 rounded-full border-2 ${
                    avatarIcon === icon
                      ? "border-cyan-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={icon}
                    alt="avatar"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>
          <h3 className="text-xl font-medium mb-2 shadow-2xl">
            Pending Rewards
          </h3>
          {pending.length === 0 ? (
            <p className="px-4 py-2 bg-black/10 backdrop-blur-sm text-white text-center border border-white/50">
              {" "}
              No rewards pending — embark on a task to earn your next Shard.
            </p>
          ) : (
            <div className="flex flex-col w-full justify-between gap-4">
              {(["check-in", "video-watch", "code-scan"] as const).map(
                (type) => {
                  const c = counts[type] || 0;
                  if (c === 0) return null;
                  const label =
                    type === "check-in"
                      ? "You’ve Arrived 🎯"
                      : type === "video-watch"
                      ? "You Tuned In 📺"
                      : "Code Cracked 🔓";
                  return (
                    <div
                      key={type}
                      className="p-4 flex justify-between w-full  items-center bg-black/10 backdrop-blur-sm border border-white/50"
                    >
                      <div className="text-lg font-semibold mb-2">{label}</div>

                      <div className=" flex gap-10 items-center">
                        <button
                          onClick={() => collectShard(type)}
                          className="bg-gradient-to-b from-[#7fc8fd] to-[#171a46]/70 text-white px-4 py-2  mr-2 cursor-pointer hover:shadow-xl transition-all duration-300 shadow-purple-300"
                        >
                          Collect Shard
                        </button>
                        <strong>x{c}</strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Collected Shards */}
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-2">Collected Shards</h3>
          <div className="flex justify-center items-center flex-wrap gap-4">
            {ELEMENTS.map((elm) => {
              const count = shardCounts[elm] || 0;
              const isZero = count === 0;
              const icon =
                elm === "Earth" ? (
                  <Image
                    src="/elements/earth-two.png"
                    alt="earth"
                    width={500}
                    height={500}
                    className={`object-contain w-full h-auto ${
                      isZero ? "filter blur-xs " : ""
                    }`}
                  />
                ) : elm === "Water" ? (
                  <Image
                    src="/elements/water-two.png"
                    alt="water"
                    width={500}
                    height={500}
                    className={`object-contain w-full h-auto ${
                      isZero ? "filter blur-xs " : ""
                    }`}
                  />
                ) : elm === "Fire" ? (
                  <Image
                    src="/elements/fire-two.png"
                    alt="fire"
                    width={500}
                    height={500}
                    className={`object-contain w-full h-auto z-40 ${
                      isZero ? "filter blur-xs " : ""
                    }`}
                  />
                ) : (
                  ""
                );
              return (
                <div
                  key={elm}
                  className="p-4  rounded-lg flex-1 w-full  flex flex-col items-center elm"
                >
                  <div className="text-4xl mb-2 relative flex items-center justify-center">
                    {icon}
                    {!isZero && (
                      <>
                        {" "}
                        <Image
                          alt="glare"
                          src={"/glare.png"}
                          width={500}
                          height={500}
                          className="absolute inset-0 m-auto h-[400px] w-[200px] -z-10 glare"
                        />
                        <Image
                          alt="glare"
                          src={"/glare.png"}
                          width={500}
                          height={500}
                          className="absolute inset-0 m-auto h-[400px] w-[200px] -z-10 glare rotate-90"
                        />
                      </>
                    )}
                  </div>
                  <div className="font-semibold">{elm} Shard</div>
                  {count > 0 && (
                    <div
                      className={`text-6xl text-shadow-lg bg-clip-text text-transparent 
                          ${
                            elm === "Water"
                              ? "bg-gradient-to-b from-cyan-300 to-blue-100 "
                              : elm === "Fire"
                              ? "bg-gradient-to-b from-amber-400 to-red-600"
                              : elm === "Earth"
                              ? "bg-gradient-to-b from-emerald-600 to-lime-200"
                              : ""
                          }
                        `}
                    >
                      x{count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* <button>
          All Shards Collected
         </button> */}
        </div>
      </div>
      {/* */}
    </div>
  );
}
