"use client";

import { useEffect, useState } from "react";

import * as React from "react";
import {
	BookOpen,
	Command,
	PieChart,
	Settings2,
	Users,
	Building,
	GraduationCap,
	UserCheck,
	type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
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

interface NavItem {
	title: string;
	url: string;
	icon: LucideIcon;
	isActive?: boolean;
	items?: Array<{
		title: string;
		url: string;
	}>;
}

// Function to get dynamic sidebar data based on user profile
function getUserData(profile: UserProfile | null) {
	const baseData = {
		user: {
			name: profile?.full_name ?? "Guest",
			email: profile?.email ?? "guest@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [] as NavItem[],
	};

	if (!profile) {
		return baseData;
	}

	// Admin-specific navigation
	if (profile.user_type === "ADMIN") {
		baseData.navMain.push(
			{
				title: "Administration",
				url: "#",
				icon: Settings2,
				isActive: true,
				items: [
					{
						title: "Departments",
						url: "/departments",
					},
					{
						title: "System Users",
						url: "#",
					},
					{
						title: "System Settings",
						url: "#",
					},
				],
			},
			{
				title: "Reports",
				url: "#",
				icon: PieChart,
				items: [
					{
						title: "Department Analytics",
						url: "#",
					},
					{
						title: "User Statistics",
						url: "#",
					},
				],
			}
		);
	}

	// HOD-specific navigation
	if (profile.user_type === "HOD") {
		baseData.navMain.push(
			{
				title: "Department Management",
				url: "#",
				icon: Building,
				isActive: true,
				items: [
					{
						title: "Users",
						url: "#",
					},
					{
						title: "Programmes",
						url: "#",
					},
					{
						title: "Batches",
						url: "#",
					},
				],
			},
			{
				title: "Academics",
				url: "#",
				icon: GraduationCap,
				items: [
					{
						title: "Degree Levels",
						url: "#",
					},
					{
						title: "Programme Management",
						url: "#",
					},
					{
						title: "Batch Management",
						url: "#",
					},
				],
			}
		);
	}

	// Staff-specific navigation
	if (profile.user_type === "STAFF") {
		baseData.navMain.push({
			title: "Student Management",
			url: "#",
			icon: Users,
			isActive: true,
			items: [
				{
					title: "Students",
					url: "#",
				},
				{
					title: "Batches",
					url: "#",
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
					title: "Students",
					url: "#",
				},
				{
					title: "Programmes",
					url: "#",
				},
			],
		});
	}

	// Student-specific navigation
	if (profile.user_type === "STUDENT") {
		baseData.navMain.push({
			title: "My Profile",
			url: "#",
			icon: UserCheck,
			isActive: true,
			items: [
				{
					title: "Profile",
					url: "#",
				},
				{
					title: "Academic Info",
					url: "#",
				},
			],
		});
	}

	return baseData;
}

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
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
