"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, BookOpen, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  ProgrammeService,
  Programme,
  CreateProgrammeRequest,
  UpdateProgrammeRequest,
} from "@/lib/programmes";
import { DegreeService, DegreeLevel } from "@/lib/degrees";
import { AuthService, UserProfile } from "@/lib/auth";

const getStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [degrees, setDegrees] = useState<DegreeLevel[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(
    null
  );
  const [formData, setFormData] = useState({
    programme_name: "",
    degree_level_id: "",
    minimum_duration_years: "",
    maximum_duration_years: "",
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
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

      // Load programmes and degrees
      await Promise.all([loadProgrammes(), loadDegrees()]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadProgrammes = async () => {
    try {
      const data = await ProgrammeService.getProgrammes();
      setProgrammes(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load programmes");
    }
  };

  const loadDegrees = async () => {
    try {
      const data = await DegreeService.getDegrees();
      setDegrees(data);
    } catch (error: any) {
      console.warn("Failed to load degrees:", error.message);
    }
  };

  const canCreateEdit = userProfile?.user_type === "HOD";
  const canDelete = userProfile?.user_type === "HOD";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.programme_name.trim() ||
      !formData.degree_level_id ||
      !formData.minimum_duration_years
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setFormLoading(true);
      const createData: CreateProgrammeRequest = {
        programme_name: formData.programme_name.trim(),
        degree_level_id: parseInt(formData.degree_level_id),
        minimum_duration_years: parseInt(formData.minimum_duration_years),
        maximum_duration_years: formData.maximum_duration_years
          ? parseInt(formData.maximum_duration_years)
          : parseInt(formData.minimum_duration_years),
      };

      await ProgrammeService.createProgramme(createData);
      toast.success("Programme created successfully");

      setIsCreateDialogOpen(false);
      resetForm();
      loadProgrammes();
    } catch (error: any) {
      toast.error(error.message || "Failed to create programme");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProgramme || !formData.programme_name.trim()) {
      toast.error("Programme name is required");
      return;
    }

    try {
      setFormLoading(true);
      const updateData: UpdateProgrammeRequest = {
        programme_name: formData.programme_name.trim(),
        minimum_duration_years: formData.minimum_duration_years
          ? parseInt(formData.minimum_duration_years)
          : undefined,
        maximum_duration_years: formData.maximum_duration_years
          ? parseInt(formData.maximum_duration_years)
          : undefined,
        is_active: formData.is_active,
      };

      await ProgrammeService.updateProgramme(
        editingProgramme.programme_id,
        updateData
      );
      toast.success("Programme updated successfully");

      setIsEditDialogOpen(false);
      resetForm();
      loadProgrammes();
    } catch (error: any) {
      toast.error(error.message || "Failed to update programme");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (programme: Programme) => {
    try {
      await ProgrammeService.deleteProgramme(programme.programme_id);
      toast.success("Programme deleted successfully");
      loadProgrammes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete programme");
    }
  };

  const openEditDialog = (programme: Programme) => {
    setEditingProgramme(programme);
    setFormData({
      programme_name: programme.programme_name,
      degree_level_id: "",
      minimum_duration_years: programme.minimum_duration_years.toString(),
      maximum_duration_years: programme.maximum_duration_years.toString(),
      is_active: programme.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      programme_name: "",
      degree_level_id: "",
      minimum_duration_years: "",
      maximum_duration_years: "",
      is_active: true,
    });
    setEditingProgramme(null);
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
                  <BreadcrumbPage>Programmes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <div>
                    <CardTitle>Department Programmes</CardTitle>
                    <CardDescription>
                      Academic programmes offered by your department
                    </CardDescription>
                  </div>
                </div>
                {canCreateEdit && (
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={(open) => {
                      setIsCreateDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>Add Programme</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <form onSubmit={handleCreate}>
                        <DialogHeader>
                          <DialogTitle>Create New Programme</DialogTitle>
                          <DialogDescription>
                            Add a new academic programme to your department.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="programme_name"
                              className="text-right"
                            >
                              Programme Name
                            </Label>
                            <Input
                              id="programme_name"
                              value={formData.programme_name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  programme_name: e.target.value,
                                })
                              }
                              placeholder="e.g., BSc Computer Science"
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="degree_level_id"
                              className="text-right"
                            >
                              Degree Level
                            </Label>
                            <Select
                              value={formData.degree_level_id}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  degree_level_id: value,
                                })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select degree level" />
                              </SelectTrigger>
                              <SelectContent>
                                {degrees.map((degree) => (
                                  <SelectItem
                                    key={degree.degree_level_id}
                                    value={degree.degree_level_id.toString()}
                                  >
                                    {degree.level_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="minimum_duration"
                              className="text-right"
                            >
                              Min Duration (Years)
                            </Label>
                            <Input
                              id="minimum_duration"
                              type="number"
                              min="1"
                              max="10"
                              value={formData.minimum_duration_years}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  minimum_duration_years: e.target.value,
                                })
                              }
                              placeholder="4"
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="maximum_duration"
                              className="text-right"
                            >
                              Max Duration (Years)
                            </Label>
                            <Input
                              id="maximum_duration"
                              type="number"
                              min="1"
                              max="15"
                              value={formData.maximum_duration_years}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  maximum_duration_years: e.target.value,
                                })
                              }
                              placeholder="6"
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={formLoading}>
                            {formLoading ? "Creating..." : "Create Programme"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : programmes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No programmes found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Programme Name</TableHead>
                      <TableHead>Degree Level</TableHead>
                      <TableHead>Duration (Years)</TableHead>
                      <TableHead>Status</TableHead>
                      {(canCreateEdit || canDelete) && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programmes.map((programme) => (
                      <TableRow key={programme.programme_id}>
                        <TableCell>
                          <Badge variant="outline">
                            {programme.programme_id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {programme.programme_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {programme.degree_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {programme.minimum_duration_years}
                          {programme.maximum_duration_years !==
                            programme.minimum_duration_years &&
                            ` - ${programme.maximum_duration_years}`}{" "}
                          years
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(programme.is_active)}
                          >
                            {programme.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {(canCreateEdit || canDelete) && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canCreateEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(programme)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
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
                                        permanently delete the programme "
                                        {programme.programme_name}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(programme)}
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
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleEdit}>
                <DialogHeader>
                  <DialogTitle>Edit Programme</DialogTitle>
                  <DialogDescription>
                    Update the programme information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_programme_name" className="text-right">
                      Programme Name
                    </Label>
                    <Input
                      id="edit_programme_name"
                      value={formData.programme_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          programme_name: e.target.value,
                        })
                      }
                      placeholder="e.g., BSc Computer Science"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="edit_minimum_duration"
                      className="text-right"
                    >
                      Min Duration (Years)
                    </Label>
                    <Input
                      id="edit_minimum_duration"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.minimum_duration_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimum_duration_years: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="edit_maximum_duration"
                      className="text-right"
                    >
                      Max Duration (Years)
                    </Label>
                    <Input
                      id="edit_maximum_duration"
                      type="number"
                      min="1"
                      max="15"
                      value={formData.maximum_duration_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maximum_duration_years: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit_is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="edit_is_active">Active Programme</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Updating..." : "Update Programme"}
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
