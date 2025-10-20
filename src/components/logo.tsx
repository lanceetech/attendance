import { cn } from "@/lib/utils";
import React from 'react';
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => (
  <Image
    src="/umma.png"
    alt="Umma University Logo"
    width={100}
    height={100}
    className={cn("h-10 w-10", className)}
  />
);

export default Logo;
