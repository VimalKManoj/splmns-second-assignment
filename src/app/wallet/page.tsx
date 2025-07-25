"use client";
import RewardUnlocked from "@/components/common/reward-unlocked";
import WalletComponent, { Shard } from "@/components/WalletComponent";
import Image from "next/image";
import React, { useState } from "react";

function Wallet() {
  type ActiveReward = { open: true; shard: Shard } | { open: false };

  const [activeReward, setActiveReward] = useState<ActiveReward>({
    open: false,
  });
  return (
    <div className="h-screen flex items-center gap-10 p-20 w-full relative">
      <div className="absolute top-0 left-0 w-full h-full ">
        <Image
          src="/wallet-background.jpg"
          alt="background"
          width={3000}
          height={3000}
          className="object-cover w-full h-full -z-40"
        />
      </div>
      <WalletComponent
        onDrop={(shard) => setActiveReward({ open: true, shard })}
      />
      {activeReward.open && (
        <RewardUnlocked
          shard={activeReward.shard}
          onClose={() => setActiveReward({ open: false })}
        />
      )}
    </div>
  );
}

export default Wallet;
