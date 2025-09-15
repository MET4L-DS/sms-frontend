"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DepartmentForm,
	DepartmentFormData,
} from "@/components/department-form";
import { Department, DepartmentService } from "@/lib/departments";
import { toast } from "sonner";

interface EditDepartmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	department: Department;
	onSuccess: () => void;
}

export function EditDepartmentDialog({
	open,
	onOpenChange,
	department,
	onSuccess,
}: EditDepartmentDialogProps) {
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (data: DepartmentFormData) => {
		try {
			setError(null);
			await DepartmentService.updateDepartment(
				department.department_id,
				data
			);
			toast.success("Department updated successfully!", {
				description: `${data.department_name} (${data.department_code}) has been updated.`,
			});
			onSuccess();
			onOpenChange(false);
		} catch (err) {
			console.error("Error updating department:", err);
			let errorMessage = "Failed to update department";
			try {
				const errorData = JSON.parse(
					err instanceof Error ? err.message : String(err)
				);
				errorMessage = errorData.error || errorMessage;
			} catch {
				// Use default error message
			}
			setError(errorMessage);
			toast.error("Failed to update department", {
				description: errorMessage,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Department</DialogTitle>
					<DialogDescription>
						Update department information. Changes to HOD email will
						update the assigned head of department.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{error}
					</div>
				)}

				<DepartmentForm
					initialData={department}
					onSubmit={handleSubmit}
					submitLabel="Update Department"
				/>
			</DialogContent>
		</Dialog>
	);
}
