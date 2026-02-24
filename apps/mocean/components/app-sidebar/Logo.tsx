"use client";

import type { FC } from "react";

import Image from "next/image";

import logo from "@/assets/images/app/logo.png";

const Logo: FC = () => {
  return (
    <div className="flex items-end gap-1 py-3 pl-2">
      <Image
        src={logo}
        className="h-9 w-9 rounded-full border border-greyscale-100 bg-gradient-to-l from-brand-primary-300 to-brand-primary-500 p-0.5 shadow-md"
        alt="Mocean"
      />

      <span className="text-nowrap font-[fantasy] text-2xl tracking-[-0.02em]">
        Mocean
      </span>
    </div>
  );
};

export default Logo;
