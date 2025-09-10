"use client";

import { useEffect, useState } from "react";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
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
import { profile } from "console";

const data = {
  user: {
    name: "Atul Prakash",
    email: "atulPrakash@tezu.ac.in",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Academics",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Degree",
          url: "#",
        },
        {
          title: "Programme",
          url: "#",
        },
        {
          title: "Batch",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [],
  projects: [],
};

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

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
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
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: profile?.full_name ?? "Guest",
            email: profile?.email ?? "guest@example.com",
            avatar: "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
