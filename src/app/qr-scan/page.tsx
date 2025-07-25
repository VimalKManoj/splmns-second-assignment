import QRScanPage from "@/components/QRScanComponent";
import Image from "next/image";
import React from "react";

function QRScan() {
  return (
    <div className="min-h-screen flex justify-center items-center w-full ">
      <div className="absolute top-0 left-0 w-full h-full ">
        <Image
          src="/qr-code-background.png"
          alt="background"
          width={1000}
          fetchPriority="high"
          priority
          height={1000}
          className="object-cover w-full h-full -z-40"
        />
      </div>
      <QRScanPage />
    </div>
  );
}

export default QRScan;
