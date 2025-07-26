import Link from "next/link";
import React from "react";
import { Turret_Road, Play } from "next/font/google";

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

function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center">
      <nav className=" mx-2 md:mx-10 my-3 px-4 md:px-10 py-3 border border-white/20 rounded-t-md z-50 text-white bg-black/10 backdrop-blur-sm w-full flex justify-between items-center">
        <Link href="/">
          <h1 className={`${turretRoad.className} hidden md:block text-lg `}>
            Elemental Shards Quest : Earn & Collect
          </h1>
          <h1 className={`${turretRoad.className} md:hidden text-sm w-2/3 `}>
            Elemental Shards Quest : Earn & Collect
          </h1>
        </Link>
        <div className={`flex gap-10 ${play.className}`}>
          <Link href="/" className="hidden md:block">
            Home
          </Link>
          <Link href="/wallet">Wallet</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
