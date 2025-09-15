"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthService, UserProfile } from "@/lib/auth";
import { DepartmentList } from "@/components/departments/department-list";

interface DashboardContentProps {
  userProfile: UserProfile;
}

function AdminDashboard({ userProfile }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faculty Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">123</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            Welcome back, {userProfile.full_name}. Here's what's happening in
            your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to different administrative sections
            like Department Management, User Administration, and System
            Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function HODDashboard({ userProfile }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>
            Welcome back, {userProfile.full_name}. Here's your department
            summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Faculty</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Programmes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StaffDashboard({ userProfile }: DashboardContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Dashboard</CardTitle>
        <CardDescription>
          Welcome back, {userProfile.full_name}. Manage students and batches
          from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use the sidebar to navigate to Student Management and Batch Management
          sections.
        </p>
      </CardContent>
    </Card>
  );
}

function FacultyDashboard({ userProfile }: DashboardContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Dashboard</CardTitle>
        <CardDescription>
          Welcome back, {userProfile.full_name}. Access your academic tools
          here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use the sidebar to access Students and Programme information.
        </p>
      </CardContent>
    </Card>
  );
}

function StudentDashboard({ userProfile }: DashboardContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Dashboard</CardTitle>
        <CardDescription>
          Welcome back, {userProfile.full_name}. View your academic information
          here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Student</Badge>
            <span className="text-sm text-muted-foreground">
              {userProfile.email}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to access your Profile and Academic Information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          const profile = await AuthService.getProfile(token);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse rounded-full bg-muted h-12 w-12"></div>
            <div className="space-y-2">
              <div className="animate-pulse rounded bg-muted h-4 w-[200px]"></div>
              <div className="animate-pulse rounded bg-muted h-4 w-[150px]"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load user profile.</p>
        </CardContent>
      </Card>
    );
  }

  // Render different dashboard based on user type
  switch (userProfile.user_type) {
    case "ADMIN":
      return <AdminDashboard userProfile={userProfile} />;
    case "HOD":
      return <HODDashboard userProfile={userProfile} />;
    case "STAFF":
      return <StaffDashboard userProfile={userProfile} />;
    case "FACULTY":
      return <FacultyDashboard userProfile={userProfile} />;
    case "STUDENT":
      return <StudentDashboard userProfile={userProfile} />;
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Unknown User Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your user type is not recognized. Please contact support.
            </p>
          </CardContent>
        </Card>
      );
  }
}
