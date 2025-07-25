import React, { useRef } from "react";
import { Play } from "next/font/google";
import Image from "next/image";

import { Shard } from "../WalletComponent";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// const play = Play({
//   variable: "--font-play",
//   weight: "400",
//   subsets: ["latin"],
// });

function RewardUnlocked({
  shard,
  onClose,
}: {
  shard: Shard;
  onClose: () => void;
}) {
  const mapImg = {
    Earth: "/elements/earth-two.png",
    Water: "/elements/water-two.png",
    Fire: "/elements/fire-two.png",
  } as const;

  const RewardContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".token",
        {
          y: 50,
          opacity: 0,
          filter: "blur(10px)",
        },
        {
          duration: 1.5,
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          stagger: 0.3,
        }
      );
      gsap.fromTo(
        ".glare",
        {
          opacity: 0,
        },
        {
          duration: 2,
          delay: 1,
          opacity: 1,

          ease: "power2.out",
        }
      );

      gsap.to(".glare", {
        scale: () => gsap.utils.random(0.9, 1, 1.5),
        rotate: 360,
        duration: () => gsap.utils.random(5, 6),
        ease: "power2.out",
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
      });
    },
    { scope: RewardContainerRef }
  );

  return (
    <div
      ref={RewardContainerRef}
      className="w-full h-full left-0 absolute backdrop-blur-sm justify-center items-center flex flex-col gap-10 z-40"
    >
      <div className="relative">
        <Image
          src={mapImg[shard]}
          alt={`${shard} Shard`}
          width={300}
          height={300}
          className="object-contain w-72 h-auto token"
        />
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
      </div>

      <div className="text-center">
        <h1 className="text-2xl token">
          Congratulations, Explorer! You’ve uncovered the {shard} Shard
        </h1>
      </div>

      <button
        onClick={onClose}
        className="bg-gradient-to-b token from-[#bb7ffd] to-[#171a46]/70 text-white px-4 py-2  mr-2 cursor-pointer hover:shadow-xl transition-all duration-300 shadow-purple-300"
      >
        Back to Wallet
      </button>
    </div>
  );
}

export default RewardUnlocked;
