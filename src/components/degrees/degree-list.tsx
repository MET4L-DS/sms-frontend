"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, GraduationCap } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	DegreeService,
	DegreeLevel,
	CreateDegreeRequest,
	UpdateDegreeRequest,
} from "@/lib/degrees";
import { AuthService, UserProfile } from "@/lib/auth";

export function DegreeList() {
	const [degrees, setDegrees] = useState<DegreeLevel[]>([]);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingDegree, setEditingDegree] = useState<DegreeLevel | null>(
		null
	);
	const [formData, setFormData] = useState({
		level_name: "",
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

				// Load degrees
				await loadDegrees();
			} catch (error: unknown) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to load data"
				);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const loadDegrees = async () => {
		try {
			const data = await DegreeService.getDegrees();
			setDegrees(data);
		} catch (error: unknown) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to load degrees"
			);
		}
	};

	// Permission checks
	const canCreateEdit = userProfile?.user_type === "ADMIN";
	const canDelete = userProfile?.user_type === "ADMIN";

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.level_name.trim()) {
			toast.error("Please fill in level name");
			return;
		}

		try {
			setFormLoading(true);
			const createData: CreateDegreeRequest = {
				level_name: formData.level_name.trim(),
			};

			await DegreeService.createDegree(createData);
			toast.success("Degree level created successfully");

			setIsCreateDialogOpen(false);
			resetForm();
			loadDegrees();
		} catch (error: unknown) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create degree level"
			);
		} finally {
			setFormLoading(false);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!editingDegree || !formData.level_name.trim()) {
			toast.error("Degree level name is required");
			return;
		}

		try {
			setFormLoading(true);
			const updateData: UpdateDegreeRequest = {
				level_name: formData.level_name.trim(),
			};

			await DegreeService.updateDegree(
				editingDegree.degree_level_id,
				updateData
			);
			toast.success("Degree level updated successfully");

			setIsEditDialogOpen(false);
			resetForm();
			loadDegrees();
		} catch (error: unknown) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update degree level"
			);
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = async (degree: DegreeLevel) => {
		try {
			await DegreeService.deleteDegree(degree.degree_level_id);
			toast.success("Degree level deleted successfully");
			loadDegrees();
		} catch (error: unknown) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete degree level"
			);
		}
	};

	const openEditDialog = (degree: DegreeLevel) => {
		setEditingDegree(degree);
		setFormData({
			level_name: degree.level_name,
		});
		setIsEditDialogOpen(true);
	};

	const resetForm = () => {
		setFormData({
			level_name: "",
		});
		setEditingDegree(null);
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<GraduationCap className="h-5 w-5" />
							<CardTitle>Degree Levels</CardTitle>
							<Badge variant="secondary">{degrees.length}</Badge>
						</div>
						<div className="flex items-center space-x-2">
							{canCreateEdit && (
								<Button
									onClick={() => setIsCreateDialogOpen(true)}
								>
									Add Degree
								</Button>
							)}
						</div>
					</div>
					<CardDescription>
						Manage academic degree levels in the system
					</CardDescription>
				</CardHeader>

				<CardContent>
					{loading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center space-x-4"
								>
									<Skeleton className="h-4 w-12" />
									<Skeleton className="h-4 flex-1" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}
						</div>
					) : degrees.length === 0 ? (
						<div className="text-center py-8">
							<GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								No degree levels found
							</p>
							{canCreateEdit && (
								<Button
									className="mt-4"
									onClick={() => setIsCreateDialogOpen(true)}
								>
									Create First Degree Level
								</Button>
							)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Level Name</TableHead>
									{(canCreateEdit || canDelete) && (
										<TableHead className="text-right">
											Actions
										</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{degrees.map((degree) => (
									<TableRow key={degree.degree_level_id}>
										<TableCell>
											<Badge variant="outline">
												{degree.degree_level_id}
											</Badge>
										</TableCell>
										<TableCell className="font-medium">
											{degree.level_name}
										</TableCell>
										{(canCreateEdit || canDelete) && (
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													{canCreateEdit && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																openEditDialog(
																	degree
																)
															}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													)}
													{canDelete && (
														<AlertDialog>
															<AlertDialogTrigger
																asChild
															>
																<Button
																	variant="ghost"
																	size="sm"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Are you
																		absolutely
																		sure?
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		This
																		action
																		cannot
																		be
																		undone.
																		This
																		will
																		permanently
																		delete
																		the
																		degree
																		level
																		&ldquo;
																		{
																			degree.level_name
																		}
																		&rdquo;
																		and may
																		affect
																		associated
																		programmes.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>
																		Cancel
																	</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleDelete(
																				degree
																			)
																		}
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

			{/* Create Dialog */}
			<Dialog
				open={isCreateDialogOpen}
				onOpenChange={(open) => {
					setIsCreateDialogOpen(open);
					if (!open) resetForm();
				}}
			>
				<DialogContent className="sm:max-w-[525px]">
					<form onSubmit={handleCreate}>
						<DialogHeader>
							<DialogTitle>Create New Degree Level</DialogTitle>
							<DialogDescription>
								Add a new academic degree level to the system.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="level_name"
									className="text-right"
								>
									Level Name
								</Label>
								<Input
									id="level_name"
									value={formData.level_name}
									onChange={(e) =>
										setFormData({
											...formData,
											level_name: e.target.value,
										})
									}
									placeholder="e.g., Bachelor's, Master's"
									className="col-span-3"
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={formLoading}>
								{formLoading
									? "Creating..."
									: "Create Degree Level"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

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
							<DialogTitle>Edit Degree Level</DialogTitle>
							<DialogDescription>
								Update the degree level information.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="edit_level_name"
									className="text-right"
								>
									Level Name
								</Label>
								<Input
									id="edit_level_name"
									value={formData.level_name}
									onChange={(e) =>
										setFormData({
											...formData,
											level_name: e.target.value,
										})
									}
									placeholder="e.g., Bachelor's, Master's"
									className="col-span-3"
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={formLoading}>
								{formLoading
									? "Updating..."
									: "Update Degree Level"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
