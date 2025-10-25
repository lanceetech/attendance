import { cn } from "@/lib/utils";
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={cn("h-10 w-10", className)}
        aria-hidden="true"
    >
        <defs>
            <path
                id="leaf"
                d="M-2,0 a2,2 0 0,1 4,0 L0,-15 Z"
            />
        </defs>
        <g transform="translate(50 45)">
            <g fill="#4caf50">
                {Array.from({ length: 15 }).map((_, i) => (
                    <use key={i} href="#leaf" transform={`rotate(${i * 12 - 84})`} />
                ))}
            </g>
        </g>
        <path
            d="M 20 95 L 20 40 L 50 60 L 80 40 L 80 95 L 50 75 Z"
            fill="#1976d2"
        />
        <circle cx="50" cy="70" r="5" fill="white" />

    </svg>
);

export default Logo;
