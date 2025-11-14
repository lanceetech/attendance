
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
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";

type DashboardHeaderProps = {
  title: string;
};

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const router = useRouter();
  const auth = useAuth();
  const { profile, isLoading } = useUserProfile();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  };
  
  const avatarImage = PlaceHolderImages.find(img => img.id === profile?.avatar);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="lg:hidden"/>
        <h1 className="text-lg font-headline font-semibold text-foreground sm:text-xl md:text-2xl truncate">
          {title}
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            {isLoading || !profile ? (
                <>
                  <div className="text-right hidden sm:block">
                     <Skeleton className="h-4 w-24 mb-1"/>
                     <Skeleton className="h-3 w-16"/>
                  </div>
                  <Skeleton className="h-9 w-9 rounded-full" />
                </>
            ) : (
              <>
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm">{profile.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <UserCircle className="h-8 w-8 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
