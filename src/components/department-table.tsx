"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Department } from "@/lib/departments";

interface DepartmentTableProps {
	departments: Department[];
	onEdit: (department: Department) => void;
	onDelete: (department: Department) => void;
}

export function DepartmentTable({
	departments,
	onEdit,
	onDelete,
}: DepartmentTableProps) {
	if (departments.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<p className="text-lg font-medium text-muted-foreground">
					No departments found
				</p>
				<p className="text-sm text-muted-foreground">
					Add your first department to get started
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Department Code</TableHead>
						<TableHead>Department Name</TableHead>
						<TableHead>HOD Name</TableHead>
						<TableHead>HOD Email</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{departments.map((department) => (
						<TableRow key={department.department_id}>
							<TableCell className="font-medium">
								{department.department_code}
							</TableCell>
							<TableCell>{department.department_name}</TableCell>
							<TableCell>{department.hod_name}</TableCell>
							<TableCell>{department.hod_email}</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(department)}
									>
										<Edit className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(department)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
