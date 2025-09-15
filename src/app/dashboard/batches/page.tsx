"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, Calendar, Users } from "lucide-react";
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
	BatchService,
	Batch,
	CreateBatchRequest,
	UpdateBatchRequest,
} from "@/lib/batches";
import { ProgrammeService, Programme } from "@/lib/programmes";
import { AuthService, UserProfile } from "@/lib/auth";

const getStatusColor = (isActive: boolean) => {
	return isActive
		? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
		: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

const getSemesterColor = (semester: "SPRING" | "AUTUMN") => {
	return semester === "SPRING"
		? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
		: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
};

export default function BatchesPage() {
	const [batches, setBatches] = useState<Batch[]>([]);
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
	const [formData, setFormData] = useState({
		programme_id: "",
		batch_name: "",
		start_year: "",
		start_semester: "" as "SPRING" | "AUTUMN" | "",
		is_active: true,
	});
	const [formLoading, setFormLoading] = useState(false);

	const loadInitialData = useCallback(async () => {
		try {
			setLoading(true);

			// Load user profile to determine permissions
			const token = localStorage.getItem("auth_token");
			if (token) {
				const profile = await AuthService.getProfile(token);
				setUserProfile(profile);
			}

			// Load batches and programmes
			await Promise.all([loadBatches(), loadProgrammes()]);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to load data";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadInitialData();
	}, [loadInitialData]);

	const loadBatches = async () => {
		try {
			const data = await BatchService.getBatches();
			setBatches(data);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to load batches";
			toast.error(errorMessage);
		}
	};

	const loadProgrammes = async () => {
		try {
			const data = await ProgrammeService.getProgrammes();
			setProgrammes(data.filter((p) => p.is_active)); // Only show active programmes
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to load programmes";
			console.warn("Failed to load programmes:", errorMessage);
		}
	};

	const canCreateEdit =
		userProfile?.user_type === "HOD" || userProfile?.user_type === "STAFF";
	const canDelete = userProfile?.user_type === "HOD";

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.programme_id ||
			!formData.batch_name.trim() ||
			!formData.start_year ||
			!formData.start_semester
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			setFormLoading(true);
			const createData: CreateBatchRequest = {
				programme_id: parseInt(formData.programme_id),
				batch_name: formData.batch_name.trim(),
				start_year: parseInt(formData.start_year),
				start_semester: formData.start_semester,
			};

			await BatchService.createBatch(createData);
			toast.success("Batch created successfully");

			setIsCreateDialogOpen(false);
			resetForm();
			loadBatches();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to create batch";
			toast.error(errorMessage);
		} finally {
			setFormLoading(false);
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!editingBatch || !formData.batch_name.trim()) {
			toast.error("Batch name is required");
			return;
		}

		try {
			setFormLoading(true);
			const updateData: UpdateBatchRequest = {
				batch_name: formData.batch_name.trim(),
				start_year: formData.start_year
					? parseInt(formData.start_year)
					: undefined,
				start_semester: formData.start_semester || undefined,
				is_active: formData.is_active,
			};

			await BatchService.updateBatch(editingBatch.batch_id, updateData);
			toast.success("Batch updated successfully");

			setIsEditDialogOpen(false);
			resetForm();
			loadBatches();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update batch";
			toast.error(errorMessage);
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = async (batch: Batch) => {
		try {
			await BatchService.deleteBatch(batch.batch_id);
			toast.success("Batch deleted successfully");
			loadBatches();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to delete batch";
			toast.error(errorMessage);
		}
	};

	const openEditDialog = (batch: Batch) => {
		setEditingBatch(batch);
		setFormData({
			programme_id: batch.programme_id.toString(),
			batch_name: batch.batch_name,
			start_year: batch.start_year.toString(),
			start_semester: batch.start_semester,
			is_active: batch.is_active,
		});
		setIsEditDialogOpen(true);
	};

	const resetForm = () => {
		setFormData({
			programme_id: "",
			batch_name: "",
			start_year: "",
			start_semester: "",
			is_active: true,
		});
		setEditingBatch(null);
	};

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

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
									<BreadcrumbPage>Batches</BreadcrumbPage>
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
									<Users className="mr-2 h-5 w-5" />
									<div>
										<CardTitle>
											Department Batches
										</CardTitle>
										<CardDescription>
											Student batches in your department
											programmes
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
											<Button>Add Batch</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[525px]">
											<form onSubmit={handleCreate}>
												<DialogHeader>
													<DialogTitle>
														Create New Batch
													</DialogTitle>
													<DialogDescription>
														Add a new student batch
														to your department.
													</DialogDescription>
												</DialogHeader>
												<div className="grid gap-4 py-4">
													<div className="grid grid-cols-4 items-center gap-4">
														<Label
															htmlFor="programme_id"
															className="text-right"
														>
															Programme
														</Label>
														<Select
															value={
																formData.programme_id
															}
															onValueChange={(
																value
															) =>
																setFormData({
																	...formData,
																	programme_id:
																		value,
																})
															}
														>
															<SelectTrigger className="col-span-3">
																<SelectValue placeholder="Select programme" />
															</SelectTrigger>
															<SelectContent>
																{programmes.map(
																	(
																		programme
																	) => (
																		<SelectItem
																			key={
																				programme.programme_id
																			}
																			value={programme.programme_id.toString()}
																		>
																			{
																				programme.programme_name
																			}
																		</SelectItem>
																	)
																)}
															</SelectContent>
														</Select>
													</div>
													<div className="grid grid-cols-4 items-center gap-4">
														<Label
															htmlFor="batch_name"
															className="text-right"
														>
															Batch Name
														</Label>
														<Input
															id="batch_name"
															value={
																formData.batch_name
															}
															onChange={(e) =>
																setFormData({
																	...formData,
																	batch_name:
																		e.target
																			.value,
																})
															}
															placeholder="e.g., 2024 Autumn Batch"
															className="col-span-3"
															required
														/>
													</div>
													<div className="grid grid-cols-4 items-center gap-4">
														<Label
															htmlFor="start_year"
															className="text-right"
														>
															Start Year
														</Label>
														<Select
															value={
																formData.start_year
															}
															onValueChange={(
																value
															) =>
																setFormData({
																	...formData,
																	start_year:
																		value,
																})
															}
														>
															<SelectTrigger className="col-span-3">
																<SelectValue placeholder="Select year" />
															</SelectTrigger>
															<SelectContent>
																{years.map(
																	(year) => (
																		<SelectItem
																			key={
																				year
																			}
																			value={year.toString()}
																		>
																			{
																				year
																			}
																		</SelectItem>
																	)
																)}
															</SelectContent>
														</Select>
													</div>
													<div className="grid grid-cols-4 items-center gap-4">
														<Label
															htmlFor="start_semester"
															className="text-right"
														>
															Start Semester
														</Label>
														<Select
															value={
																formData.start_semester
															}
															onValueChange={(
																value:
																	| "SPRING"
																	| "AUTUMN"
															) =>
																setFormData({
																	...formData,
																	start_semester:
																		value,
																})
															}
														>
															<SelectTrigger className="col-span-3">
																<SelectValue placeholder="Select semester" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="SPRING">
																	Spring
																</SelectItem>
																<SelectItem value="AUTUMN">
																	Autumn
																</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</div>
												<DialogFooter>
													<Button
														type="submit"
														disabled={formLoading}
													>
														{formLoading
															? "Creating..."
															: "Create Batch"}
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
							) : batches.length === 0 ? (
								<div className="text-center py-8">
									<Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
									<p className="text-muted-foreground">
										No batches found
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>Batch Name</TableHead>
											<TableHead>Programme</TableHead>
											<TableHead>Start Year</TableHead>
											<TableHead>Semester</TableHead>
											<TableHead>Status</TableHead>
											{(canCreateEdit || canDelete) && (
												<TableHead className="text-right">
													Actions
												</TableHead>
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{batches.map((batch) => (
											<TableRow key={batch.batch_id}>
												<TableCell>
													<Badge variant="outline">
														{batch.batch_id}
													</Badge>
												</TableCell>
												<TableCell className="font-medium">
													{batch.batch_name}
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">
															{
																batch.programme_name
															}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline">
														<Calendar className="mr-1 h-3 w-3" />
														{batch.start_year}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														className={getSemesterColor(
															batch.start_semester
														)}
													>
														{batch.start_semester}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														className={getStatusColor(
															batch.is_active
														)}
													>
														{batch.is_active
															? "Active"
															: "Inactive"}
													</Badge>
												</TableCell>
												{(canCreateEdit ||
													canDelete) && (
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															{canCreateEdit && (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		openEditDialog(
																			batch
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
																				Are
																				you
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
																				batch
																				&quot;
																				{
																					batch.batch_name
																				}
																				&quot;.
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>
																				Cancel
																			</AlertDialogCancel>
																			<AlertDialogAction
																				onClick={() =>
																					handleDelete(
																						batch
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
									<DialogTitle>Edit Batch</DialogTitle>
									<DialogDescription>
										Update the batch information.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-4 items-center gap-4">
										<Label
											htmlFor="edit_batch_name"
											className="text-right"
										>
											Batch Name
										</Label>
										<Input
											id="edit_batch_name"
											value={formData.batch_name}
											onChange={(e) =>
												setFormData({
													...formData,
													batch_name: e.target.value,
												})
											}
											placeholder="e.g., 2024 Autumn Batch"
											className="col-span-3"
											required
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label
											htmlFor="edit_start_year"
											className="text-right"
										>
											Start Year
										</Label>
										<Select
											value={formData.start_year}
											onValueChange={(value) =>
												setFormData({
													...formData,
													start_year: value,
												})
											}
										>
											<SelectTrigger className="col-span-3">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{years.map((year) => (
													<SelectItem
														key={year}
														value={year.toString()}
													>
														{year}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label
											htmlFor="edit_start_semester"
											className="text-right"
										>
											Start Semester
										</Label>
										<Select
											value={formData.start_semester}
											onValueChange={(
												value: "SPRING" | "AUTUMN"
											) =>
												setFormData({
													...formData,
													start_semester: value,
												})
											}
										>
											<SelectTrigger className="col-span-3">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="SPRING">
													Spring
												</SelectItem>
												<SelectItem value="AUTUMN">
													Autumn
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex items-center space-x-2">
										<Switch
											id="edit_is_active"
											checked={formData.is_active}
											onCheckedChange={(
												checked: boolean
											) =>
												setFormData({
													...formData,
													is_active: checked,
												})
											}
										/>
										<Label htmlFor="edit_is_active">
											Active Batch
										</Label>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="submit"
										disabled={formLoading}
									>
										{formLoading
											? "Updating..."
											: "Update Batch"}
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
