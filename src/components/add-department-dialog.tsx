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
import { DepartmentService } from "@/lib/departments";
import { toast } from "sonner";

interface AddDepartmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function AddDepartmentDialog({
	open,
	onOpenChange,
	onSuccess,
}: AddDepartmentDialogProps) {
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (data: DepartmentFormData) => {
		try {
			setError(null);
			await DepartmentService.createDepartment(data);
			toast.success("Department created successfully!", {
				description: `${data.department_name} (${data.department_code}) has been added.`,
			});
			onSuccess();
			onOpenChange(false);
		} catch (err) {
			console.error("Error creating department:", err);
			let errorMessage = "Failed to create department";
			try {
				const errorData = JSON.parse(
					err instanceof Error ? err.message : String(err)
				);
				errorMessage = errorData.error || errorMessage;
			} catch {
				// Use default error message
			}
			setError(errorMessage);
			toast.error("Failed to create department", {
				description: errorMessage,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Department</DialogTitle>
					<DialogDescription>
						Create a new department. The HOD will be automatically
						created if they don&apos;t exist in the system.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{error}
					</div>
				)}

				<DepartmentForm
					onSubmit={handleSubmit}
					submitLabel="Create Department"
				/>
			</DialogContent>
		</Dialog>
	);
}
