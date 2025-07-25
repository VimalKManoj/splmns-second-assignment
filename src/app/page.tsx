"use client";
import ActionCard from "@/components/Landing Page/action-card";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Turret_Road, Play } from "next/font/google";
import gsap from "gsap";

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

const COOLDOWNS = {
  location: { key: "lastCheckIn", ms: 60_000 },
  video: { key: "lastVideoWatch", ms: 60_000 },
  code: { key: "lastCodeScan", ms: 60_000 },
};

const COMPLETED = {
  location: "completed_location",
  video: "completed_video",
  code: "completed_code",
};

export default function Home() {
  // cooldown timers
  const [cds, setCds] = useState({ location: 0, video: 0, code: 0 });
  // unlocked flags
  const [unlocked, setUnlocked] = useState({
    location: true,
    video: false,
    code: false,
  });

  // refs to each card container
  const videoRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  // compute ms remaining
  const computeCd = (key: string, ms: number) => {
    const last = parseInt(localStorage.getItem(key) || "0", 10);
    return Math.max(0, ms - (Date.now() - last));
  };

  // tick cooldowns
  useEffect(() => {
    const update = () =>
      setCds({
        location: computeCd(COOLDOWNS.location.key, COOLDOWNS.location.ms),
        video: computeCd(COOLDOWNS.video.key, COOLDOWNS.video.ms),
        code: computeCd(COOLDOWNS.code.key, COOLDOWNS.code.ms),
      });
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // on mount, read completion and unlock in order
  useEffect(() => {
    const locDone = !!localStorage.getItem(COMPLETED.location);
    const vidDone = !!localStorage.getItem(COMPLETED.video);
    // const codeDone = !!localStorage.getItem(COMPLETED.code);

    setUnlocked({
      location: true,
      video: locDone,
      code: vidDone,
    });
  }, []);

  // animate flip when video unlocks
  useEffect(() => {
    if (unlocked.video && videoRef.current) {
      gsap.fromTo(
        videoRef.current,
        { rotateY: 90, transformPerspective: 600, force3D: true },
        { rotateY: 0, duration: 2.5, ease: "power4.out" }
      );
    }
  }, [unlocked.video]);

  // animate flip when code unlocks
  useEffect(() => {
    if (unlocked.code && codeRef.current) {
      gsap.fromTo(
        codeRef.current,
        { rotateY: 90, transformPerspective: 600, force3D: true },
        { rotateY: 0, duration: 2.5, ease: "power4.out", delay: 0.1 }
      );
    }
  }, [unlocked.code]);
  return (
    <div className="min-h-screen flex flex-col justify-between items-start pt-32 p-20 relative bg-black">
      <div className="absolute top-0 left-0 w-full h-full ">
        <Image
          src="/background.png"
          alt="background"
          width={3000}
          height={3000}
          className="object-cover w-full h-full -z-20"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/90 to-transparent z-40"></div>
      <div className="z-40 flex flex-col md:flex-row justify-center items-center md:items-start w-full gap-20">
        <ActionCard
          title="Check In at the Landmark"
          description="Arrive at the designated location to unlock your next Shard."
          imageSrc="/location.png"
          href="/location-checkin"
          cooldown={cds.location}
          enabled={true}
        />

        {/* Video card wrapped in ref */}
        <div ref={videoRef} className="transform-gpu">
          <ActionCard
            title="Watch the Mystic Chronicle"
            description="View 15 seconds of the mystic video to claim your next Shard."
            imageSrc="/video.png"
            href={unlocked.video ? "/video-watch" : "#"}
            cooldown={cds.video}
            enabled={unlocked.video}
          />
        </div>

        {/* QR card wrapped in ref */}
        <div ref={codeRef} className="transform-gpu">
          <ActionCard
            title="Scan the Arcane Sigil"
            description="Use your camera to scan the hidden QR sigil and unveil your next Shard."
            imageSrc="/qr-code.png"
            href={unlocked.code ? "/qr-scan" : "#"}
            cooldown={cds.code}
            enabled={unlocked.code}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-10 md:gap-0 items-end z-50">
        <h1
          className={`z-40 ${turretRoad.className} mt-20 md:mt-0 text-5xl flex-1 text-white md:text-nowrap relative`}
        >
          <Image
            src="/elements/earth-two.png"
            alt="earth"
            width={300}
            height={300}
            className="object-contain w-auto h-20 absolute -top-20 md:-top-16  left-0"
          />
          <Image
            src="/elements/fire-two.png"
            alt="earth"
            width={300}
            height={300}
            className="object-contain w-auto h-20 absolute -top-20 md:-top-16  left-20"
          />
          <Image
            src="/elements/water-two.png"
            alt="earth"
            width={300}
            height={300}
            className="object-contain w-auto h-22 absolute -top-20 md:-top-16  left-40"
          />
          Unlock the Power of the <span className="md:text-8xl">3</span>
        </h1>
        <h1
          className={`w-full md:w-2/4 text-white/80 ${play.className} p-6 border border-[#25D2BE]  text-sm text-white bg-black/30 backdrop-blur-sm`}
        >
          Embark on a journey to collect three ancient shards—
          <span className="earth bg-gradient-to-r from-emerald-500 to-emerald-700 text-white inline-block px-3 cursor-pointer relative ">
            Earth
          </span>{" "}
          ,{" "}
          <span className="fire bg-gradient-to-r from-orange-300 to-orange-700 text-white inline-block px-3 cursor-pointer">
            Fire
          </span>{" "}
          , 
          <span className="water bg-gradient-to-r from-cyan-300 to-cyan-700 text-white inline-block px-3 cursor-pointer ">
            Water
          </span>{" "}
          —by completing simple real‑world tasks. Check in at the legendary
          location, watch a 15‑second scroll, or scan the hidden sigil to earn a
          random Shard each time. Gather all three to become the Elemental
          Master and unlock your ultimate reward!
        </h1>
      </div>
    </div>
  );
}
