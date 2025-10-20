import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <BookOpen className={cn("h-10 w-10", className)} />
);

export default Logo;
