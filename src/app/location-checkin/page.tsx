import LocationCheckIn from "@/components/LocationCheckinComponent";
import Image from "next/image";
import React from "react";

function LocationCheckin() {
  return (
    <div className="min-h-screen flex justify-center items-center w-full ">
      <div className="absolute top-0 left-0 w-full h-full ">
        <Image
          src="/location-background.jpg"
          alt="background"
          width={3000}
          height={3000}
          className="object-cover w-full h-full -z-40"
        />
      </div>
      <LocationCheckIn />
    </div>
  );
}

export default LocationCheckin;
