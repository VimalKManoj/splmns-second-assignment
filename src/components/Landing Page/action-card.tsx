import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Turret_Road, Play } from "next/font/google";
// import { LockClosedIcon } from "@heroicons/react/solid"; // npm install @heroicons/react

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

interface ActionCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
  cooldown?: number; // ms remaining
  enabled?: boolean; // true = unlocked, false = locked
}

export default function ActionCard({
  title,
  description,
  imageSrc,
  href,
  cooldown = 0,
  enabled = true,
}: ActionCardProps) {
  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000),
      m = Math.floor(s / 60),
      sec = s % 60;
    return `${m < 10 ? "0" + m : m}:${sec < 10 ? "0" + sec : sec}`;
  };

  const isCooling = enabled && cooldown > 0;
  const isLocked = !enabled;

  return (
    <div className="relative w-72 z-40">
      <Link
        href={enabled ? href : "#"}
        className={`
          block
          ${
            !isLocked ? "hover:scale-110 transition-transform duration-300" : ""
          }
          ${isCooling || isLocked ? "pointer-events-none" : ""}
        `}
      >
        {/* Image */}
        <Image
          src={imageSrc}
          alt={title}
          width={340}
          height={420}
          className={`
            object-contain w-80 h-full
            ${isCooling || isLocked ? "filter blur-sm opacity-60" : ""}
          `}
        />

        {/* Text Card */}
        <div
          className={`
          p-2 flex flex-col justify-center items-center bg-black/5 relative
          border-r border-b border-[#25D2BE] -top-10 backdrop-blur-2xl
          ${isCooling || isLocked ? "filter blur-sm opacity-60" : ""}
        `}
        >
          <h1 className={`${turretRoad.className} text-lg text-white`}>
            {title}
          </h1>
          <p className={`text-white/90 ${play.className} text-center text-sm`}>
            {description}
          </p>
        </div>
      </Link>

      {/* Cooldown Overlay */}
      {isCooling && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${play.className}`}
        >
          <h2 className="text-white text-lg">Cooling Down</h2>
          <span className="mt-2 border border-cyan-500 px-3 py-2 text-2xl font-mono text-cyan-500 bg-black/70 backdrop-blur-sm">
            {fmt(cooldown)}
          </span>
        </div>
      )}

      {/* Locked Overlay */}
      {isLocked && !isCooling && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${play.className}`}
        >
          <Image
            src="/lock.png"
            alt="locked"
            width={300}
            height={300}
            className="object-contain w-60 h-auto  "
            style={{ filter: "drop-shadow(0 0 20px #06b6d4)" }}
            priority
          />
          <h2 className="text-fuchsia-300 text-shadow-lg shadow-fuchsia-300 text-lg">
            Locked
          </h2>
          <h2 className="text-white text-sm w-2/3 text-center">
            {" "}
            Complete the prior quest to unlock this challenge.
          </h2>
        </div>
      )}
    </div>
  );
}
