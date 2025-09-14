"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AuthService, UserProfile } from "@/lib/auth";
import { DepartmentTable } from "@/components/department-table";
import { AddDepartmentDialog } from "@/components/add-department-dialog";
import { EditDepartmentDialog } from "@/components/edit-department-dialog";
import { DeleteDepartmentDialog } from "@/components/delete-department-dialog";
import { Department, DepartmentService } from "@/lib/departments";
import { toast } from "sonner";

export default function DepartmentsPage() {
	const router = useRouter();
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog states
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedDepartment, setSelectedDepartment] =
		useState<Department | null>(null);

	useEffect(() => {
		const token = AuthService.getToken();
		if (!token) {
			router.push("/login");
			return;
		}

		// Get user profile
		AuthService.getProfile(token)
			.then((userProfile) => {
				if (userProfile.user_type !== "ADMIN") {
					router.push("/dashboard");
					return;
				}
				// Load departments
				return DepartmentService.getDepartments();
			})
			.then((depts) => {
				if (depts) {
					setDepartments(depts);
				}
			})
			.catch((err) => {
				console.error("Error:", err);
				const errorMessage = "Failed to load data";
				setError(errorMessage);
				toast.error("Failed to load departments", {
					description:
						"Unable to fetch department data. Please try again.",
				});
				if (err.message.includes("token")) {
					AuthService.removeToken();
					router.push("/login");
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}, [router]);

	const refreshDepartments = async () => {
		try {
			const depts = await DepartmentService.getDepartments();
			setDepartments(depts);
		} catch (err) {
			console.error("Error refreshing departments:", err);
			const errorMessage = "Failed to refresh departments";
			setError(errorMessage);
			toast.error("Failed to refresh departments", {
				description: "Unable to fetch latest department data.",
			});
		}
	};

	const handleEdit = (department: Department) => {
		setSelectedDepartment(department);
		setShowEditDialog(true);
	};

	const handleDelete = (department: Department) => {
		setSelectedDepartment(department);
		setShowDeleteDialog(true);
	};

	if (loading) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex h-16 items-center justify-center">
						Loading...
					</div>
				</SidebarInset>
			</SidebarProvider>
		);
	}

	if (error) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex h-16 items-center justify-center text-red-500">
						{error}
					</div>
				</SidebarInset>
			</SidebarProvider>
		);
	}

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
										Dashboard
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Departments</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">Departments</h1>
							<p className="text-muted-foreground">
								Manage university departments and their heads
							</p>
						</div>
						<Button onClick={() => setShowAddDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Department
						</Button>
					</div>

					<DepartmentTable
						departments={departments}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</div>
			</SidebarInset>

			<AddDepartmentDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onSuccess={refreshDepartments}
			/>

			{selectedDepartment && (
				<>
					<EditDepartmentDialog
						open={showEditDialog}
						onOpenChange={setShowEditDialog}
						department={selectedDepartment}
						onSuccess={refreshDepartments}
					/>

					<DeleteDepartmentDialog
						open={showDeleteDialog}
						onOpenChange={setShowDeleteDialog}
						department={selectedDepartment}
						onSuccess={refreshDepartments}
					/>
				</>
			)}
		</SidebarProvider>
	);
}
