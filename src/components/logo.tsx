import { cn } from "@/lib/utils";
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("h-10 w-10", className)}
  >
    <style>
      {`
        .pen-nib { fill: #000; }
        .pen-body { fill: #005A87; }
        .leaves { fill: #8DC63F; }
        .sun { fill: #FBB03B; }
      `}
    </style>
    {/* Pen Body */}
    <path
      d="M42 95 L35 70 L50 40 L65 70 L58 95 Z"
      className="pen-body"
    />
    {/* Pen Nib */}
    <path
      d="M50 40 L48 35 L52 35 Z"
      className="pen-nib"
    />
    <rect x="49" y="30" width="2" height="5" className="pen-nib" />
    
    {/* Leaves */}
    <g className="leaves">
      {/* Center Leaf */}
      <path d="M50 30 C 50 10, 50 10, 50 0" stroke="currentColor" strokeWidth="4" />
      
      {/* Right Leaves */}
      <path d="M50 30 C 60 25, 70 15, 75 5" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 58 28, 65 20, 68 10" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 55 29, 60 25, 62 18" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 52 29, 55 27, 56 22" stroke="currentColor" strokeWidth="3" />
      
      {/* Right-er Leaves */}
       <path d="M50 30 C 65 28, 80 20, 88 8" stroke="currentColor" strokeWidth="3" />
       <path d="M50 30 C 62 29, 72 24, 79 15" stroke="currentColor" strokeWidth="3" />
       <path d="M50 30 C 58 29, 65 26, 70 20" stroke="currentColor" strokeWidth="3" />

      {/* Left Leaves */}
      <path d="M50 30 C 40 25, 30 15, 25 5" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 42 28, 35 20, 32 10" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 45 29, 40 25, 38 18" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 48 29, 45 27, 44 22" stroke="currentColor" strokeWidth="3" />
      
      {/* Left-er Leaves */}
      <path d="M50 30 C 35 28, 20 20, 12 8" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 38 29, 28 24, 21 15" stroke="currentColor" strokeWidth="3" />
      <path d="M50 30 C 42 29, 35 26, 30 20" stroke="currentColor" strokeWidth="3" />
    </g>
    {/* Sun */}
    <circle cx="50" cy="30" r="5" className="sun" />
  </svg>
);

export default Logo;
