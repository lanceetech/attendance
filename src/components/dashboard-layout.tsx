
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
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  DoorOpen,
  Send,
  LogOut,
  QrCode,
  HardHat,
  Camera,
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
    { href: "/admin/system-status", label: "System Status", icon: HardHat },
  ],
  lecturer: [
    { href: "/lecturer", label: "My Timetable", icon: Calendar },
    { href: "/lecturer/attendance", label: "Attendance", icon: QrCode },
    { href: "/lecturer/feedback", label: "Report Issue", icon: Send },
  ],
  student: [
    { href: "/student", label: "My Timetable", icon: Calendar },
    { href: "/student/scan-attendance", label: "Scan Attendance", icon: Camera },
    { href: "/student/feedback", label = "Report Issue", icon: Send },
  ],
};

export default function DashboardLayout({
  children,
  role,
  collapsible = "offcanvas",
}: {
  children: React.ReactNode;
  role: Role;
  collapsible?: "offcanvas" | "icon";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMenuItems = menuItems[role];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-secondary/20">
        <Sidebar collapsible={collapsible}>
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
                      tooltip={item.label}
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
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
