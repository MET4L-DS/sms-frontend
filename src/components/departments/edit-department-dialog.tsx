"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	DepartmentService,
	Department,
	CreateDepartmentRequest,
} from "@/lib/department";
import { AuthService } from "@/lib/auth";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const formSchema = z.object({
	department_code: z
		.string()
		.min(2, "Department code must be at least 2 characters")
		.max(10, "Department code must not exceed 10 characters")
		.regex(
			/^[A-Z0-9]+$/,
			"Department code must contain only uppercase letters and numbers"
		),
	department_name: z
		.string()
		.min(5, "Department name must be at least 5 characters")
		.max(100, "Department name must not exceed 100 characters"),
	hod_email: z
		.string()
		.email("Please enter a valid email address")
		.min(1, "HOD email is required"),
});

interface EditDepartmentDialogProps {
	department: Department;
	onDepartmentUpdated?: () => void;
}

export function EditDepartmentDialog({
	department,
	onDepartmentUpdated,
}: EditDepartmentDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<CreateDepartmentRequest>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			department_code: department.department_code,
			department_name: department.department_name,
			hod_email: department.hod_email,
		},
	});

	// Reset form when department changes or dialog opens
	useEffect(() => {
		if (open) {
			form.reset({
				department_code: department.department_code,
				department_name: department.department_name,
				hod_email: department.hod_email,
			});
		}
	}, [open, department, form]);

	async function onSubmit(values: CreateDepartmentRequest) {
		const token = AuthService.getToken();
		if (!token) {
			toast.error("Authentication required");
			return;
		}

		// Check if any values have changed
		const hasChanges =
			values.department_code !== department.department_code ||
			values.department_name !== department.department_name ||
			values.hod_email !== department.hod_email;

		if (!hasChanges) {
			toast.info("No changes detected");
			setOpen(false);
			return;
		}

		setIsLoading(true);
		try {
			await DepartmentService.updateDepartment(
				token,
				department.department_id,
				values
			);
			toast.success(
				`Department "${values.department_code}" updated successfully!`
			);
			setOpen(false);
			onDepartmentUpdated?.();
		} catch (error) {
			const errorMessage = extractErrorMessage(
				error,
				"Failed to update department"
			);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="mr-2"
					aria-label={`Edit department ${department.department_code}`}
				>
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Edit Department: {department.department_code}
					</DialogTitle>
					<DialogDescription>
						Update department information. If the HOD email
						doesn&apos;t exist in this department, a new user will
						be created and assigned as HOD.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<FormField
							control={form.control}
							name="department_code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Department Code</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., CSE, EEE, ME"
											{...field}
											style={{
												textTransform: "uppercase",
											}}
											onChange={(e) =>
												field.onChange(
													e.target.value.toUpperCase()
												)
											}
										/>
									</FormControl>
									<FormDescription>
										Short code for the department (uppercase
										letters and numbers only)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="department_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Department Name</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Computer Science and Engineering"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Full name of the department
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="hod_email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>HOD Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="hod@example.com"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Email address for the Head of
										Department. System will check if user
										exists in this department, otherwise
										create new user and assign as HOD.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading
									? "Updating..."
									: "Update Department"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
