"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import {
  BookOpen,
  Command,
  Settings2,
  Users,
  Building,
  GraduationCap,
  UserCheck,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { AuthService, UserProfile } from "@/lib/auth";

/**
 * Get dynamic sidebar data based on user profile
 * Returns navigation items specific to the user's role
 */
function getUserData(profile: UserProfile | null) {
  const baseData = {
    user: {
      name: profile?.full_name ?? "Guest",
      email: profile?.email ?? "guest@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [] as Array<{
      title: string;
      url: string;
      icon: any;
      isActive?: boolean;
      items: Array<{
        title: string;
        url: string;
      }>;
    }>,
  };

  if (!profile) {
    return baseData;
  }

  // Admin-specific navigation
  if (profile.user_type === "ADMIN") {
    baseData.navMain.push({
      title: "Administration",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Departments",
          url: "/dashboard/departments",
        },
        {
          title: "Degrees",
          url: "/dashboard/degrees",
        },
        {
          title: "Users",
          url: "/dashboard/users",
        },
      ],
    });
  }

  // HOD-specific navigation
  if (profile.user_type === "HOD") {
    baseData.navMain.push({
      title: "Department Management",
      url: "#",
      icon: Building,
      isActive: true,
      items: [
        {
          title: "Programmes",
          url: "/dashboard/programmes",
        },
        {
          title: "Batches",
          url: "/dashboard/batches",
        },
        {
          title: "Faculty",
          url: "/dashboard/faculties",
        },
      ],
    });
  }

  // Staff-specific navigation
  if (profile.user_type === "STAFF") {
    baseData.navMain.push({
      title: "Academic Management",
      url: "#",
      icon: GraduationCap,
      isActive: true,
      items: [
        {
          title: "Programmes",
          url: "/dashboard/programmes",
        },
        {
          title: "Batches",
          url: "/dashboard/batches",
        },
      ],
    });
  }

  // Faculty-specific navigation
  if (profile.user_type === "FACULTY") {
    baseData.navMain.push({
      title: "Academics",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Programmes",
          url: "/dashboard/programmes",
        },
        {
          title: "Batches",
          url: "/dashboard/batches",
        },
      ],
    });
  }

  // Student-specific navigation
  if (profile.user_type === "STUDENT") {
    baseData.navMain.push({
      title: "Academics",
      url: "#",
      icon: UserCheck,
      isActive: true,
      items: [
        {
          title: "Programmes",
          url: "/dashboard/programmes",
        },
        {
          title: "Batches",
          url: "/dashboard/batches",
        },
      ],
    });
  }

  return baseData;
}

/**
 * App sidebar component with role-based navigation
 * Displays different navigation items based on user role
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = AuthService.getToken();
    if (token) {
      AuthService.getProfile(token)
        .then(setProfile)
        .catch(() => AuthService.removeToken());
    }
  }, []);

  const data = getUserData(profile);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Tezpur University
                  </span>
                  <span className="truncate text-xs">
                    {profile?.user_type ?? "Guest"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
