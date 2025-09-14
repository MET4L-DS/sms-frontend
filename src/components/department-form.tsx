"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Department } from "@/lib/departments";

const departmentFormSchema = z.object({
	department_code: z
		.string()
		.min(2, "Department code must be at least 2 characters")
		.max(10, "Department code must be at most 10 characters")
		.regex(
			/^[A-Z0-9]+$/,
			"Department code must contain only uppercase letters and numbers"
		),
	department_name: z
		.string()
		.min(3, "Department name must be at least 3 characters")
		.max(100, "Department name must be at most 100 characters"),
	hod_email: z.string().email("Please enter a valid email address"),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface DepartmentFormProps {
	initialData?: Partial<Department>;
	onSubmit: (data: DepartmentFormData) => Promise<void>;
	submitLabel?: string;
	disabled?: boolean;
}

export function DepartmentForm({
	initialData,
	onSubmit,
	submitLabel = "Submit",
	disabled = false,
}: DepartmentFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<DepartmentFormData>({
		resolver: zodResolver(departmentFormSchema),
		defaultValues: {
			department_code: initialData?.department_code || "",
			department_name: initialData?.department_name || "",
			hod_email: initialData?.hod_email || "",
		},
	});

	const handleSubmit = async (data: DepartmentFormData) => {
		setIsSubmitting(true);
		try {
			await onSubmit(data);
			if (!initialData) {
				form.reset();
			}
		} catch (error) {
			console.error("Form submission error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-4"
			>
				<FormField
					control={form.control}
					name="department_code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Department Code</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g. CSE, EEE, ME"
									{...field}
									disabled={disabled || isSubmitting}
									style={{ textTransform: "uppercase" }}
									onChange={(e) => {
										field.onChange(
											e.target.value.toUpperCase()
										);
									}}
								/>
							</FormControl>
							<FormDescription>
								A unique code for the department (2-10
								characters, uppercase)
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
									placeholder="e.g. Computer Science and Engineering"
									{...field}
									disabled={disabled || isSubmitting}
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
									placeholder="hod.department@university.edu"
									{...field}
									disabled={disabled || isSubmitting}
								/>
							</FormControl>
							<FormDescription>
								Email address of the Head of Department. If the
								HOD doesn&apos;t exist in the system, they will
								be created automatically.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					disabled={disabled || isSubmitting}
					className="w-full"
				>
					{isSubmitting ? "Submitting..." : submitLabel}
				</Button>
			</form>
		</Form>
	);
}
