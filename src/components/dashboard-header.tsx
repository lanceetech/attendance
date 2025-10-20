"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/data";
import { SidebarTrigger } from "./ui/sidebar";

type DashboardHeaderProps = {
  title: string;
  user: User;
};

export function DashboardHeader({ title, user }: DashboardHeaderProps) {
  const router = useRouter();
  const avatarImage = PlaceHolderImages.find(img => img.id === user.avatar);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden"/>
        <h1 className="text-xl font-headline font-semibold text-foreground md:text-2xl">
          {title}
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Avatar className="h-9 w-9">
              {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={user.name} />}
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/")}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
