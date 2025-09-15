"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Department, DepartmentService } from "@/lib/departments";
import { toast } from "sonner";

interface DeleteDepartmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	department: Department;
	onSuccess: () => void;
}

export function DeleteDepartmentDialog({
	open,
	onOpenChange,
	department,
	onSuccess,
}: DeleteDepartmentDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setIsDeleting(true);
		setError(null);

		try {
			await DepartmentService.deleteDepartment(department.department_id);
			toast.success("Department deleted successfully!", {
				description: `${department.department_name} (${department.department_code}) has been removed.`,
			});
			onSuccess();
			onOpenChange(false);
		} catch (err) {
			console.error("Error deleting department:", err);
			let errorMessage = "Failed to delete department";
			try {
				const errorData = JSON.parse(
					err instanceof Error ? err.message : String(err)
				);
				errorMessage = errorData.error || errorMessage;
			} catch {
				// Use default error message
			}
			setError(errorMessage);
			toast.error("Failed to delete department", {
				description: errorMessage,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Department</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<p>
							Are you sure you want to delete the department{" "}
							<strong>{department.department_name}</strong> (
							{department.department_code})?
						</p>
						<p className="text-destructive font-medium">
							This action cannot be undone. All associated data
							may be affected.
						</p>
						{error && (
							<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isDeleting ? "Deleting..." : "Delete Department"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
