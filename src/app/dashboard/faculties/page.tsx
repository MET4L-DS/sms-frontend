"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Users,
  Phone,
  GraduationCap,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  FacultyService,
  Faculty,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  FacultyProfileUpdateRequest,
} from "@/lib/faculties";
import { AuthService, UserProfile } from "@/lib/auth";

const getStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editingProfile, setEditingProfile] = useState<Faculty | null>(null);
  const [createFormData, setCreateFormData] = useState({
    email: "",
  });
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    specialization: "",
    is_active: true,
  });
  const [profileFormData, setProfileFormData] = useState({
    phone_number: "",
    specialization: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load user profile to determine permissions
        const token = localStorage.getItem("auth_token");
        if (token) {
          const profile = await AuthService.getProfile(token);
          setUserProfile(profile);
        }

        // Load faculties
        await loadFaculties();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load user profile to determine permissions
      const token = localStorage.getItem("auth_token");
      if (token) {
        const profile = await AuthService.getProfile(token);
        setUserProfile(profile);
      }

      // Load faculties
      await loadFaculties();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    try {
      const data = await FacultyService.getFaculties();
      setFaculties(data);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load faculties"
      );
    }
  };

  // Permission checks
  const canCreateEdit = userProfile?.user_type === "HOD";
  const canDelete = userProfile?.user_type === "HOD";
  const canUpdateProfile = (faculty: Faculty) => {
    return (
      userProfile?.user_type === "HOD" ||
      (userProfile?.user_type === "FACULTY" &&
        faculty.email === userProfile?.email)
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createFormData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setFormLoading(true);
      const createData: CreateFacultyRequest = {
        email: createFormData.email.trim().toLowerCase(),
      };

      const result = await FacultyService.createFaculty(createData);
      toast.success(
        "Faculty created successfully. Password set to email address."
      );

      setIsCreateDialogOpen(false);
      resetCreateForm();
      loadFaculties();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create faculty"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingFaculty || !editFormData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    try {
      setFormLoading(true);
      const updateData: UpdateFacultyRequest = {
        full_name: editFormData.full_name.trim(),
        email: editFormData.email.trim().toLowerCase() || undefined,
        phone_number: editFormData.phone_number.trim() || undefined,
        specialization: editFormData.specialization.trim() || undefined,
        is_active: editFormData.is_active,
      };

      await FacultyService.updateFaculty(editingFaculty.user_id, updateData);
      toast.success("Faculty updated successfully");

      setIsEditDialogOpen(false);
      resetEditForm();
      loadFaculties();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update faculty"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProfile) {
      toast.error("No faculty selected for profile update");
      return;
    }

    try {
      setFormLoading(true);
      const profileData: FacultyProfileUpdateRequest = {
        phone_number: profileFormData.phone_number.trim() || undefined,
        specialization: profileFormData.specialization.trim() || undefined,
      };

      await FacultyService.updateFacultyProfile(
        editingProfile.user_id,
        profileData
      );
      toast.success("Profile updated successfully");

      setIsProfileDialogOpen(false);
      resetProfileForm();
      loadFaculties();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (faculty: Faculty) => {
    try {
      const result = await FacultyService.deleteFaculty(faculty.user_id);
      toast.success(
        `Faculty "${result.deleted_faculty.full_name}" deleted successfully`
      );
      loadFaculties();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete faculty"
      );
    }
  };

  const openEditDialog = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setEditFormData({
      full_name: faculty.full_name,
      email: faculty.email,
      phone_number: faculty.phone_number || "",
      specialization: faculty.specialization || "",
      is_active: faculty.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openProfileDialog = (faculty: Faculty) => {
    setEditingProfile(faculty);
    setProfileFormData({
      phone_number: faculty.phone_number || "",
      specialization: faculty.specialization || "",
    });
    setIsProfileDialogOpen(true);
  };

  const resetCreateForm = () => {
    setCreateFormData({
      email: "",
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      full_name: "",
      email: "",
      phone_number: "",
      specialization: "",
      is_active: true,
    });
    setEditingFaculty(null);
  };

  const resetProfileForm = () => {
    setProfileFormData({
      phone_number: "",
      specialization: "",
    });
    setEditingProfile(null);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    SMS Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Faculty Members</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Faculty Members</h1>
              <p className="text-muted-foreground">
                Manage faculty members in your department
              </p>
            </div>
            {canCreateEdit && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (!open) resetCreateForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>Add Faculty</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreate}>
                    <DialogHeader>
                      <DialogTitle>Create New Faculty Member</DialogTitle>
                      <DialogDescription>
                        Add a new faculty member to your department. Password
                        will be set to their email address.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="faculty_email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="faculty_email"
                          type="email"
                          value={createFormData.email}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              email: e.target.value,
                            })
                          }
                          placeholder="faculty@university.edu"
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={formLoading}>
                        {formLoading ? "Creating..." : "Create Faculty"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Department Faculty
              </CardTitle>
              <CardDescription>
                Faculty members in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : faculties.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No faculty members found
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculties.map((faculty) => (
                      <TableRow key={faculty.user_id}>
                        <TableCell>
                          <Badge variant="outline">{faculty.user_id}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {faculty.full_name || "Not set"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            {faculty.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {faculty.phone_number ? (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              {faculty.phone_number}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {faculty.specialization ? (
                            <div className="flex items-center">
                              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                              {faculty.specialization}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(faculty.is_active)}>
                            {faculty.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdateProfile(faculty) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openProfileDialog(faculty)}
                                title="Update profile (phone & specialization)"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            {canCreateEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(faculty)}
                                title="Edit faculty details"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Delete faculty"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the faculty member
                                      &ldquo;
                                      {faculty.full_name || faculty.email}
                                      &rdquo;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(faculty)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Faculty Dialog (HOD only) */}
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) resetEditForm();
            }}
          >
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleEdit}>
                <DialogHeader>
                  <DialogTitle>Edit Faculty Member</DialogTitle>
                  <DialogDescription>
                    Update faculty member information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_full_name" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="edit_full_name"
                      value={editFormData.full_name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          full_name: e.target.value,
                        })
                      }
                      placeholder="Dr. John Smith"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      placeholder="faculty@university.edu"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_phone_number" className="text-right">
                      Phone Number
                    </Label>
                    <Input
                      id="edit_phone_number"
                      value={editFormData.phone_number}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="+1234567890"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_specialization" className="text-right">
                      Specialization
                    </Label>
                    <Textarea
                      id="edit_specialization"
                      value={editFormData.specialization}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="Machine Learning, AI"
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit_is_active"
                      checked={editFormData.is_active}
                      onCheckedChange={(checked: boolean) =>
                        setEditFormData({ ...editFormData, is_active: checked })
                      }
                    />
                    <Label htmlFor="edit_is_active">Active Faculty</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Updating..." : "Update Faculty"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Profile Update Dialog (HOD or Faculty self-update) */}
          <Dialog
            open={isProfileDialogOpen}
            onOpenChange={(open) => {
              setIsProfileDialogOpen(open);
              if (!open) resetProfileForm();
            }}
          >
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleProfileUpdate}>
                <DialogHeader>
                  <DialogTitle>Update Profile</DialogTitle>
                  <DialogDescription>
                    Update your phone number and specialization.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="profile_phone_number"
                      className="text-right"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="profile_phone_number"
                      value={profileFormData.phone_number}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="+1234567890"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="profile_specialization"
                      className="text-right"
                    >
                      Specialization
                    </Label>
                    <Textarea
                      id="profile_specialization"
                      value={profileFormData.specialization}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="Machine Learning, AI, Data Science"
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
