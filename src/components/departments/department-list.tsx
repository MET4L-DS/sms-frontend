"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepartmentService, Department } from "@/lib/department";
import { AuthService, UserProfile } from "@/lib/auth";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { AddDepartmentDialog } from "./add-department-dialog";
import { EditDepartmentDialog } from "./edit-department-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Trash2 } from "lucide-react";

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    const token = AuthService.getToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      const userProfile = await AuthService.getProfile(token);
      setUser(userProfile);
    } catch (error) {
      setError("Failed to load user profile");
    }
  };

  const fetchDepartments = async () => {
    const token = AuthService.getToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const departmentList = await DepartmentService.getAllDepartments(token);
      setDepartments(departmentList);
      setError(null);
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to load departments"
      );
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
  }, []);

  const handleDepartmentAdded = () => {
    fetchDepartments();
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    const token = AuthService.getToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      await DepartmentService.deleteDepartment(token, departmentId);
      toast.success("Department deleted successfully!");
      fetchDepartments();
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to delete department"
      );
      toast.error(errorMessage);
    }
  };

  if (error && !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Department Management</CardTitle>
            <CardDescription>Manage departments and their HODs</CardDescription>
          </div>
          {user?.user_type === "ADMIN" && (
            <AddDepartmentDialog onDepartmentAdded={handleDepartmentAdded} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-destructive mb-2">{error}</p>
            <Button onClick={fetchDepartments} variant="outline">
              Try Again
            </Button>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No departments found.</p>
            {user?.user_type === "ADMIN" && (
              <p className="text-sm text-muted-foreground mt-2">
                Create your first department to get started.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all departments in the system</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>HOD Name</TableHead>
                <TableHead>HOD Email</TableHead>
                {user?.user_type === "ADMIN" && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.department_id}>
                  <TableCell>
                    <Badge variant="secondary">
                      {department.department_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {department.department_name}
                  </TableCell>
                  <TableCell>{department.hod_name || "Not assigned"}</TableCell>
                  <TableCell>{department.hod_email}</TableCell>
                  {user?.user_type === "ADMIN" && (
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <EditDepartmentDialog
                                  department={department}
                                  onDepartmentUpdated={fetchDepartments}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit department details</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                aria-label={`Delete department ${department.department_code}`}
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
                                  permanently delete the department "
                                  {department.department_name}" and may affect
                                  associated programmes and faculties.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteDepartment(
                                      department.department_id
                                    )
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
