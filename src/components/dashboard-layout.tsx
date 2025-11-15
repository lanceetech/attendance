
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
  SidebarGroup,
  SidebarGroupLabel,
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
  FileUp,
  Download,
  Users,
  Settings,
  FileText,
} from "lucide-react";
import Logo from "./logo";
import { Button } from "./ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

type Role = "admin" | "lecturer" | "student";

const menuItems = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/manage-schedule", label: "Manage Schedule", icon: Calendar },
    { href: "/admin/upload-timetable", label: "Upload Timetable", icon: FileUp },
    { href: "/admin/resolve-conflicts", label: "Resolve Conflicts", icon: AlertTriangle },
    { href: "/admin/classrooms", label: "Classrooms", icon: DoorOpen },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/system-status", label: "System Status", icon: HardHat },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  lecturer: [
    { href: "/lecturer", label: "My Timetable", icon: Calendar },
    { href: "/lecturer/attendance", label: "Attendance", icon: QrCode },
    { href: "/lecturer/feedback", label: "Report Issue", icon: Send },
    { href: "/lecturer/settings", label: "Settings", icon: Settings },
  ],
  student: [
    { href: "/student", label: "My Timetable", icon: Calendar },
    { href: "/student/feedback", label: "Report Issue", icon: Send },
    { href: "/student/settings", label: "Settings", icon: Settings },
  ],
};

const handleDownload = () => {
    window.print();
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
  const auth = useAuth();
  const currentMenuItems = menuItems[role];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar collapsible={collapsible}>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
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
            {role === 'student' && (
              <SidebarGroup>
                <SidebarGroupLabel>Academics</SidebarGroupLabel>
                 <SidebarMenu>
                    <SidebarMenuItem>
                         <Link href="/student/scan-attendance" passHref>
                            <SidebarMenuButton
                            isActive={pathname === "/student/scan-attendance"}
                            tooltip="Scan Attendance"
                            >
                                <Camera />
                                <span>Scan Attendance</span>
                            </SidebarMenuButton>
                         </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                        onClick={handleDownload}
                        tooltip="Download Timetable"
                        >
                            <Download />
                            <span>Download Timetable</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
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
