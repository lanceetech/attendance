"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  DoorOpen,
  BookOpen,
  Send,
  LogOut,
  QrCode,
  HardHat,
} from "lucide-react";
import Logo from "./logo";
import { Button } from "./ui/button";

type Role = "admin" | "lecturer" | "student";

const menuItems = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/manage-schedule", label: "Manage Schedule", icon: Calendar },
    { href: "/admin/resolve-conflicts", label: "Resolve Conflicts", icon: AlertTriangle },
    { href: "/admin/classrooms", label: "Classrooms", icon: DoorOpen },
  ],
  lecturer: [
    { href: "/lecturer", label: "My Timetable", icon: Calendar },
    { href: "/lecturer/attendance", label: "Attendance", icon: QrCode },
    { href: "/lecturer/feedback", label: "Report Issue", icon: Send },
  ],
  student: [
    { href: "/student", label: "My Timetable", icon: Calendar },
    { href: "/student/feedback", label: "Report Issue", icon: Send },
  ],
};

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMenuItems = menuItems[role];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-headline font-semibold">ClassSync</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {currentMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push("/")}>
              <LogOut />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="md:hidden flex items-center p-2 border-b">
                <SidebarTrigger />
                 <div className="flex items-center gap-2 mx-auto">
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="text-lg font-headline font-semibold">ClassSync</span>
                </div>
            </div>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
