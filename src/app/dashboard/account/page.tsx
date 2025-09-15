"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, MapPin, Home } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { AuthGuard } from "@/components/auth";
import { AuthService } from "@/lib/auth";
import {
	AccountService,
	UserProfile,
	UpdateProfileRequest,
} from "@/lib/account";
import {
	ProfileService,
	StudentProfile,
	FacultyProfile,
	Address,
	Batch,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

// Form validation schemas
const profileSchema = z.object({
	full_name: z.string().min(2, "Full name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
});

const passwordSchema = z
	.object({
		current_password: z.string().min(1, "Current password is required"),
		new_password: z
			.string()
			.min(8, "Password must be at least 8 characters"),
		confirm_password: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "Passwords don't match",
		path: ["confirm_password"],
	});

const studentProfileSchema = z.object({
	is_part_time: z.boolean().optional(),
	roll_number: z.string().min(1, "Roll number is required").optional(),
	date_of_birth: z.date().optional(),
	self_phone_number: z.string().min(10, "Invalid phone number").optional(),
	guardian_phone_number: z
		.string()
		.min(10, "Invalid guardian phone number")
		.optional(),
	batch_id: z.number().optional(),
});

const facultyProfileSchema = z.object({
	phone_number: z.string().min(10, "Invalid phone number").optional(),
	specialization: z
		.string()
		.min(2, "Specialization must be at least 2 characters")
		.optional(),
});

const addressSchema = z.object({
	address_line_1: z.string().min(1, "Address line 1 is required"),
	address_line_2: z.string().optional(),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	postal_code: z.string().min(1, "Postal code is required"),
	country: z.string().min(1, "Country is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
type FacultyProfileFormData = z.infer<typeof facultyProfileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Account management page component
 * Allows users to view and update their profile information and password
 */
export default function AccountPage() {
	const router = useRouter();

	// Main state
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	// Loading states
	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
	const [isUpdatingStudentProfile, setIsUpdatingStudentProfile] =
		useState(false);
	const [isUpdatingFacultyProfile, setIsUpdatingFacultyProfile] =
		useState(false);
	const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

	// Profile-specific data
	const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
		null
	);
	const [addresses, setAddresses] = useState<Address[]>([]);

	// Supporting data
	const [batches, setBatches] = useState<Batch[]>([]);

	// Address management
	const [editingAddressId, setEditingAddressId] = useState<number | null>(
		null
	);
	const [showNewAddressForm, setShowNewAddressForm] = useState(false);

	// Form instances
	const profileForm = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			full_name: "",
			email: "",
		},
	});

	const passwordForm = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const studentProfileForm = useForm<StudentProfileFormData>({
		resolver: zodResolver(studentProfileSchema),
		defaultValues: {
			is_part_time: false,
			roll_number: "",
			date_of_birth: undefined,
			self_phone_number: "",
			guardian_phone_number: "",
			batch_id: undefined,
		},
	});

	const facultyProfileForm = useForm<FacultyProfileFormData>({
		resolver: zodResolver(facultyProfileSchema),
		defaultValues: {
			phone_number: "",
			specialization: "",
		},
	});

	const addressForm = useForm<AddressFormData>({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			address_line_1: "",
			address_line_2: "",
			city: "",
			state: "",
			postal_code: "",
			country: "India", // Default country
		},
	});

	/**
	 * Load user profile and associated data on component mount
	 */
	useEffect(() => {
		const loadProfileData = async () => {
			try {
				const token = AuthService.getToken();
				if (!token) {
					router.push("/login");
					return;
				}

				// Load basic user profile
				const userProfile = await AccountService.getUserProfile(token);
				setProfile(userProfile);

				// Update basic profile form
				profileForm.reset({
					full_name: userProfile.full_name,
					email: userProfile.email,
				});

				// Load supporting data
				try {
					const [batchData] = await Promise.allSettled([
						ProfileService.getBatches(token),
					]);

					if (batchData.status === "fulfilled")
						setBatches(batchData.value);
				} catch (error) {
					console.warn("Failed to load supporting data:", error);
				}

				// Load type-specific profile data
				if (userProfile.user_type === "STUDENT") {
					try {
						const studentData =
							await ProfileService.getStudentProfile(token);
						setStudentProfile(studentData);

						studentProfileForm.reset({
							is_part_time: studentData.is_part_time || false,
							roll_number: studentData.roll_number || "",
							date_of_birth: studentData.date_of_birth
								? new Date(studentData.date_of_birth)
								: undefined,
							self_phone_number:
								studentData.self_phone_number || "",
							guardian_phone_number:
								studentData.guardian_phone_number || "",
							batch_id: studentData.batch_id,
						});

						// Load addresses for students
						const addressData = await ProfileService.getAddresses(
							token
						);
						setAddresses(addressData);
					} catch {
						console.warn(
							"Student profile not found, can be created"
						);
					}
				} else if (userProfile.user_type === "FACULTY") {
					try {
						const facultyData =
							await ProfileService.getFacultyProfile(token);

						facultyProfileForm.reset({
							phone_number: facultyData.phone_number || "",
							specialization: facultyData.specialization || "",
						});
					} catch {
						console.warn(
							"Faculty profile not found, can be created"
						);
					}
				}
			} catch {
				console.error("Failed to load profile");
				toast.error("Failed to load profile data");
			} finally {
				setLoading(false);
			}
		};

		loadProfileData();
	}, [router, profileForm, studentProfileForm, facultyProfileForm]);

	/**
	 * Handle basic profile information update
	 */
	const handleProfileUpdate = async (data: ProfileFormData) => {
		try {
			setIsUpdatingProfile(true);
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			const updateData: UpdateProfileRequest = {
				full_name: data.full_name,
				email: data.email,
			};

			await AccountService.updateUserProfile(token, updateData);

			// Update local profile state
			setProfile((prev) => (prev ? { ...prev, ...updateData } : null));

			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Profile update failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update profile"
			);
		} finally {
			setIsUpdatingProfile(false);
		}
	};

	/**
	 * Handle password change
	 */
	const handlePasswordChange = async (data: PasswordFormData) => {
		try {
			setIsUpdatingPassword(true);
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			const updateData: UpdateProfileRequest = {
				current_password: data.current_password,
				new_password: data.new_password,
			};

			await AccountService.updateUserProfile(token, updateData);

			// Clear password form after successful update
			passwordForm.reset();

			toast.success("Password updated successfully");
		} catch (error) {
			console.error("Password update failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update password"
			);
		} finally {
			setIsUpdatingPassword(false);
		}
	};

	/**
	 * Handle student profile update
	 */
	const handleStudentProfileUpdate = async (data: StudentProfileFormData) => {
		if (!profile) return;

		try {
			setIsUpdatingStudentProfile(true);
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			const updateData: Partial<StudentProfile> = {
				is_part_time: data.is_part_time,
				roll_number: data.roll_number,
				date_of_birth: data.date_of_birth
					? format(data.date_of_birth, "yyyy-MM-dd")
					: undefined,
				self_phone_number: data.self_phone_number,
				guardian_phone_number: data.guardian_phone_number,
				batch_id: data.batch_id,
			};

			await ProfileService.updateStudentProfile(
				token,
				profile.user_id!,
				updateData
			);

			// Reload student profile data
			try {
				const updatedStudentProfile =
					await ProfileService.getStudentProfile(token);
				setStudentProfile(updatedStudentProfile);
			} catch {
				// Profile might have been created for the first time
			}

			toast.success("Student profile updated successfully");
		} catch (error) {
			console.error("Student profile update failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update student profile"
			);
		} finally {
			setIsUpdatingStudentProfile(false);
		}
	};

	/**
	 * Handle faculty profile update
	 */
	const handleFacultyProfileUpdate = async (data: FacultyProfileFormData) => {
		if (!profile) return;

		try {
			setIsUpdatingFacultyProfile(true);
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			const updateData: Partial<FacultyProfile> = {
				phone_number: data.phone_number,
				specialization: data.specialization,
			};

			await ProfileService.updateFacultyProfile(
				token,
				profile.user_id!,
				updateData
			);

			// Reload faculty profile data
			try {
				await ProfileService.getFacultyProfile(token);
			} catch {
				// Profile might have been created for the first time
			}

			toast.success("Faculty profile updated successfully");
		} catch (error) {
			console.error("Faculty profile update failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update faculty profile"
			);
		} finally {
			setIsUpdatingFacultyProfile(false);
		}
	};

	/**
	 * Handle address creation
	 */
	const handleAddressCreate = async (data: AddressFormData) => {
		if (!profile) return;

		try {
			setIsUpdatingAddress(true);
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			const addressData: Omit<Address, "address_id"> = {
				user_id: profile.user_id!,
				...data,
			};

			await ProfileService.createAddress(token, addressData);

			// Reload addresses
			const updatedAddresses = await ProfileService.getAddresses(token);
			setAddresses(updatedAddresses);

			// Reset form and close
			addressForm.reset();
			setShowNewAddressForm(false);

			toast.success("Address added successfully");
		} catch (error) {
			console.error("Address creation failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to add address"
			);
		} finally {
			setIsUpdatingAddress(false);
		}
	};

	/**
	 * Handle address update
	 */
	const handleAddressUpdate = async (data: AddressFormData) => {
		if (!editingAddressId) return;

		try {
			setIsUpdatingAddress(true);
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			await ProfileService.updateAddress(token, editingAddressId, data);

			// Reload addresses
			const updatedAddresses = await ProfileService.getAddresses(token);
			setAddresses(updatedAddresses);

			// Reset form and close editing
			addressForm.reset();
			setEditingAddressId(null);

			toast.success("Address updated successfully");
		} catch (error) {
			console.error("Address update failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update address"
			);
		} finally {
			setIsUpdatingAddress(false);
		}
	};

	/**
	 * Handle address deletion
	 */
	const handleAddressDelete = async (addressId: number) => {
		try {
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			await ProfileService.deleteAddress(token, addressId);

			// Reload addresses
			const updatedAddresses = await ProfileService.getAddresses(token);
			setAddresses(updatedAddresses);

			toast.success("Address deleted successfully");
		} catch (error) {
			console.error("Address deletion failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete address"
			);
		}
	};

	/**
	 * Handle address type assignment
	 */
	const handleAddressAssign = async (
		addressId: number,
		type: "current" | "permanent"
	) => {
		try {
			const token = AuthService.getToken();
			if (!token) {
				router.push("/login");
				return;
			}

			await ProfileService.assignAddressType(token, addressId, type);

			// Reload student profile to see updated address assignments
			if (profile?.user_type === "STUDENT") {
				try {
					const updatedStudentProfile =
						await ProfileService.getStudentProfile(token);
					setStudentProfile(updatedStudentProfile);
				} catch (error) {
					console.warn("Could not reload student profile:", error);
				}
			}

			toast.success(`Address assigned as ${type} address successfully`);
		} catch (error) {
			console.error("Address assignment failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: `Failed to assign ${type} address`
			);
		}
	};

	if (loading) {
		return (
			<AuthGuard>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<div className="flex items-center justify-center min-h-screen">
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
								<p>Loading profile...</p>
							</div>
						</div>
					</SidebarInset>
				</SidebarProvider>
			</AuthGuard>
		);
	}

	if (!profile) {
		return (
			<AuthGuard>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<div className="flex items-center justify-center min-h-screen">
							<Card className="max-w-md">
								<CardHeader>
									<CardTitle>Profile Not Found</CardTitle>
									<CardDescription>
										Unable to load your profile information.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button
										onClick={() => router.push("/login")}
									>
										Return to Login
									</Button>
								</CardContent>
							</Card>
						</div>
					</SidebarInset>
				</SidebarProvider>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard>
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
										<BreadcrumbPage>
											Account Settings
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
						<div className="max-w-4xl mx-auto w-full">
							<div className="mb-8">
								<h1 className="text-3xl font-bold">
									Account Settings
								</h1>
								<p className="text-muted-foreground">
									Manage your profile information and account
									security settings.
								</p>
							</div>

							{/* Profile Overview Card */}
							<Card className="mb-8">
								<CardHeader>
									<CardTitle>Profile Overview</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center space-x-4">
										<div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center text-xl font-semibold">
											{profile.full_name
												.charAt(0)
												.toUpperCase()}
										</div>
										<div>
											<h3 className="text-xl font-semibold">
												{profile.full_name}
											</h3>
											<p className="text-muted-foreground">
												{profile.email}
											</p>
											<div className="mt-2">
												<Badge variant="secondary">
													{profile.user_type}
												</Badge>
												{profile.department_id && (
													<Badge
														variant="outline"
														className="ml-2"
													>
														Department:{" "}
														{profile.department_id}
													</Badge>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Settings Tabs */}
							<Tabs defaultValue="profile" className="space-y-6">
								<TabsList
									className={cn(
										"grid w-full",
										profile.user_type === "STUDENT"
											? "grid-cols-4"
											: profile.user_type === "FACULTY"
											? "grid-cols-3"
											: "grid-cols-2"
									)}
								>
									<TabsTrigger value="profile">
										Basic Info
									</TabsTrigger>
									{profile.user_type === "STUDENT" && (
										<TabsTrigger value="student">
											Student Profile
										</TabsTrigger>
									)}
									{profile.user_type === "FACULTY" && (
										<TabsTrigger value="faculty">
											Faculty Profile
										</TabsTrigger>
									)}
									{profile.user_type === "STUDENT" && (
										<TabsTrigger value="addresses">
											Addresses
										</TabsTrigger>
									)}
									<TabsTrigger value="security">
										Security
									</TabsTrigger>
								</TabsList>

								{/* Profile Information Tab */}
								<TabsContent value="profile">
									<Card>
										<CardHeader>
											<CardTitle>
												Profile Information
											</CardTitle>
											<CardDescription>
												Update your personal information
												and contact details.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<Form {...profileForm}>
												<form
													onSubmit={profileForm.handleSubmit(
														handleProfileUpdate
													)}
													className="space-y-6"
												>
													<FormField
														control={
															profileForm.control
														}
														name="full_name"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Full Name
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Enter your full name"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={
															profileForm.control
														}
														name="email"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Email
																	Address
																</FormLabel>
																<FormControl>
																	<Input
																		type="email"
																		placeholder="Enter your email"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<Separator />

													<div className="flex justify-end">
														<Button
															type="submit"
															disabled={
																isUpdatingProfile
															}
														>
															{isUpdatingProfile
																? "Updating..."
																: "Update Profile"}
														</Button>
													</div>
												</form>
											</Form>
										</CardContent>
									</Card>
								</TabsContent>

								{/* Security Tab */}
								<TabsContent value="security">
									<Card>
										<CardHeader>
											<CardTitle>
												Change Password
											</CardTitle>
											<CardDescription>
												Update your password to keep
												your account secure.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<Form {...passwordForm}>
												<form
													onSubmit={passwordForm.handleSubmit(
														handlePasswordChange
													)}
													className="space-y-6"
												>
													<FormField
														control={
															passwordForm.control
														}
														name="current_password"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Current
																	Password
																</FormLabel>
																<FormControl>
																	<Input
																		type="password"
																		placeholder="Enter your current password"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={
															passwordForm.control
														}
														name="new_password"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	New Password
																</FormLabel>
																<FormControl>
																	<Input
																		type="password"
																		placeholder="Enter your new password"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={
															passwordForm.control
														}
														name="confirm_password"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Confirm New
																	Password
																</FormLabel>
																<FormControl>
																	<Input
																		type="password"
																		placeholder="Confirm your new password"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<Separator />

													<div className="flex justify-end">
														<Button
															type="submit"
															disabled={
																isUpdatingPassword
															}
														>
															{isUpdatingPassword
																? "Updating..."
																: "Update Password"}
														</Button>
													</div>
												</form>
											</Form>
										</CardContent>
									</Card>
								</TabsContent>

								{/* Student Profile Tab */}
								{profile.user_type === "STUDENT" && (
									<TabsContent value="student">
										<Card>
											<CardHeader>
												<CardTitle>
													Student Profile
												</CardTitle>
												<CardDescription>
													Update your academic
													information and student
													details.
												</CardDescription>
											</CardHeader>
											<CardContent>
												<Form {...studentProfileForm}>
													<form
														onSubmit={studentProfileForm.handleSubmit(
															handleStudentProfileUpdate
														)}
														className="space-y-6"
													>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<FormField
																control={
																	studentProfileForm.control
																}
																name="roll_number"
																render={({
																	field,
																}) => (
																	<FormItem>
																		<FormLabel>
																			Roll
																			Number
																		</FormLabel>
																		<FormControl>
																			<Input
																				placeholder="Enter your roll number"
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<FormField
																control={
																	studentProfileForm.control
																}
																name="batch_id"
																render={({
																	field,
																}) => (
																	<FormItem>
																		<FormLabel>
																			Batch
																		</FormLabel>
																		<Select
																			onValueChange={(
																				value
																			) =>
																				field.onChange(
																					value
																						? parseInt(
																								value
																						  )
																						: undefined
																				)
																			}
																			value={field.value?.toString()}
																		>
																			<FormControl>
																				<SelectTrigger>
																					<SelectValue placeholder="Select your batch" />
																				</SelectTrigger>
																			</FormControl>
																			<SelectContent>
																				{batches.map(
																					(
																						batch
																					) => (
																						<SelectItem
																							key={
																								batch.batch_id
																							}
																							value={batch.batch_id.toString()}
																						>
																							{
																								batch.batch_name
																							}{" "}
																							(
																							{
																								batch.programme_name
																							}
																							)
																						</SelectItem>
																					)
																				)}
																			</SelectContent>
																		</Select>
																		<FormMessage />
																	</FormItem>
																)}
															/>
														</div>

														<FormField
															control={
																studentProfileForm.control
															}
															name="date_of_birth"
															render={({
																field,
															}) => (
																<FormItem className="flex flex-col">
																	<FormLabel>
																		Date of
																		Birth
																	</FormLabel>
																	<Popover>
																		<PopoverTrigger
																			asChild
																		>
																			<FormControl>
																				<Button
																					variant={
																						"outline"
																					}
																					className={cn(
																						"w-full pl-3 text-left font-normal",
																						!field.value &&
																							"text-muted-foreground"
																					)}
																				>
																					{field.value ? (
																						format(
																							field.value,
																							"PPP"
																						)
																					) : (
																						<span>
																							Pick
																							your
																							date
																							of
																							birth
																						</span>
																					)}
																					<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																				</Button>
																			</FormControl>
																		</PopoverTrigger>
																		<PopoverContent
																			className="w-auto p-0"
																			align="start"
																		>
																			<Calendar
																				mode="single"
																				selected={
																					field.value
																				}
																				onSelect={
																					field.onChange
																				}
																				disabled={(
																					date
																				) =>
																					date >
																						new Date() ||
																					date <
																						new Date(
																							"1900-01-01"
																						)
																				}
																				initialFocus
																			/>
																		</PopoverContent>
																	</Popover>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<FormField
																control={
																	studentProfileForm.control
																}
																name="self_phone_number"
																render={({
																	field,
																}) => (
																	<FormItem>
																		<FormLabel>
																			Your
																			Phone
																			Number
																		</FormLabel>
																		<FormControl>
																			<Input
																				placeholder="Enter your phone number"
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<FormField
																control={
																	studentProfileForm.control
																}
																name="guardian_phone_number"
																render={({
																	field,
																}) => (
																	<FormItem>
																		<FormLabel>
																			Guardian
																			Phone
																			Number
																		</FormLabel>
																		<FormControl>
																			<Input
																				placeholder="Enter guardian phone number"
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
														</div>

														<FormField
															control={
																studentProfileForm.control
															}
															name="is_part_time"
															render={({
																field,
															}) => (
																<FormItem className="flex flex-row items-start space-x-3 space-y-0">
																	<FormControl>
																		<Checkbox
																			checked={
																				field.value
																			}
																			onCheckedChange={
																				field.onChange
																			}
																		/>
																	</FormControl>
																	<div className="space-y-1 leading-none">
																		<FormLabel>
																			Part-time
																			Student
																		</FormLabel>
																		<p className="text-sm text-muted-foreground">
																			Check
																			if
																			you
																			are
																			a
																			part-time
																			student
																		</p>
																	</div>
																</FormItem>
															)}
														/>

														<Separator />

														<div className="flex justify-end">
															<Button
																type="submit"
																disabled={
																	isUpdatingStudentProfile
																}
															>
																{isUpdatingStudentProfile
																	? "Updating..."
																	: "Update Student Profile"}
															</Button>
														</div>
													</form>
												</Form>
											</CardContent>
										</Card>
									</TabsContent>
								)}

								{/* Faculty Profile Tab */}
								{profile.user_type === "FACULTY" && (
									<TabsContent value="faculty">
										<Card>
											<CardHeader>
												<CardTitle>
													Faculty Profile
												</CardTitle>
												<CardDescription>
													Update your professional
													information and
													specialization.
												</CardDescription>
											</CardHeader>
											<CardContent>
												<Form {...facultyProfileForm}>
													<form
														onSubmit={facultyProfileForm.handleSubmit(
															handleFacultyProfileUpdate
														)}
														className="space-y-6"
													>
														<FormField
															control={
																facultyProfileForm.control
															}
															name="phone_number"
															render={({
																field,
															}) => (
																<FormItem>
																	<FormLabel>
																		Phone
																		Number
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Enter your phone number"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={
																facultyProfileForm.control
															}
															name="specialization"
															render={({
																field,
															}) => (
																<FormItem>
																	<FormLabel>
																		Specialization
																	</FormLabel>
																	<FormControl>
																		<Textarea
																			placeholder="Enter your area of specialization"
																			className="resize-none"
																			{...field}
																		/>
																	</FormControl>
																	<p className="text-sm text-muted-foreground">
																		Describe
																		your
																		area of
																		expertise
																		and
																		research
																		interests.
																	</p>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<Separator />

														<div className="flex justify-end">
															<Button
																type="submit"
																disabled={
																	isUpdatingFacultyProfile
																}
															>
																{isUpdatingFacultyProfile
																	? "Updating..."
																	: "Update Faculty Profile"}
															</Button>
														</div>
													</form>
												</Form>
											</CardContent>
										</Card>
									</TabsContent>
								)}

								{/* Addresses Tab - Student Only */}
								{profile.user_type === "STUDENT" && (
									<TabsContent value="addresses">
										<div className="space-y-6">
											{/* Current & Permanent Addresses Status */}
											<Card>
												<CardHeader>
													<CardTitle>
														Address Overview
													</CardTitle>
													<CardDescription>
														Manage your current and
														permanent addresses.
													</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div className="flex items-center space-x-2">
															<Home className="h-4 w-4 text-blue-500" />
															<span className="text-sm">
																Current Address:
															</span>
															{studentProfile?.current_address_id ? (
																<Badge variant="secondary">
																	Set
																</Badge>
															) : (
																<Badge variant="outline">
																	Not Set
																</Badge>
															)}
														</div>
														<div className="flex items-center space-x-2">
															<MapPin className="h-4 w-4 text-green-500" />
															<span className="text-sm">
																Permanent
																Address:
															</span>
															{studentProfile?.permanent_address_id ? (
																<Badge variant="secondary">
																	Set
																</Badge>
															) : (
																<Badge variant="outline">
																	Not Set
																</Badge>
															)}
														</div>
													</div>
												</CardContent>
											</Card>

											{/* Address List */}
											<Card>
												<CardHeader>
													<div className="flex justify-between items-center">
														<div>
															<CardTitle>
																Your Addresses
															</CardTitle>
															<CardDescription>
																Add and manage
																your addresses.
																You can assign
																them as current
																or permanent.
															</CardDescription>
														</div>
														<Button
															onClick={() => {
																setShowNewAddressForm(
																	true
																);
																addressForm.reset();
															}}
															size="sm"
														>
															<Plus className="h-4 w-4 mr-2" />
															Add Address
														</Button>
													</div>
												</CardHeader>
												<CardContent className="space-y-4">
													{addresses.map(
														(address) => (
															<Card
																key={
																	address.address_id
																}
																className="border-l-4 border-l-blue-200"
															>
																<CardContent className="pt-4">
																	<div className="flex justify-between items-start">
																		<div className="space-y-1">
																			<p className="font-medium">
																				{
																					address.address_line_1
																				}
																			</p>
																			{address.address_line_2 && (
																				<p className="text-sm text-muted-foreground">
																					{
																						address.address_line_2
																					}
																				</p>
																			)}
																			<p className="text-sm text-muted-foreground">
																				{
																					address.city
																				}
																				,{" "}
																				{
																					address.state
																				}{" "}
																				{
																					address.postal_code
																				}
																			</p>
																			<p className="text-sm text-muted-foreground">
																				{
																					address.country
																				}
																			</p>
																		</div>
																		<div className="flex gap-2">
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() =>
																					handleAddressAssign(
																						address.address_id!,
																						"current"
																					)
																				}
																			>
																				Set
																				Current
																			</Button>
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() =>
																					handleAddressAssign(
																						address.address_id!,
																						"permanent"
																					)
																				}
																			>
																				Set
																				Permanent
																			</Button>
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() => {
																					setEditingAddressId(
																						address.address_id!
																					);
																					addressForm.reset(
																						address
																					);
																				}}
																			>
																				Edit
																			</Button>
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() =>
																					handleAddressDelete(
																						address.address_id!
																					)
																				}
																			>
																				<Trash2 className="h-4 w-4" />
																			</Button>
																		</div>
																	</div>
																</CardContent>
															</Card>
														)
													)}

													{addresses.length === 0 && (
														<div className="text-center py-8 text-muted-foreground">
															<MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
															<p>
																No addresses
																added yet.
															</p>
															<p className="text-sm">
																Add your first
																address to get
																started.
															</p>
														</div>
													)}
												</CardContent>
											</Card>

											{/* Add/Edit Address Form */}
											{(showNewAddressForm ||
												editingAddressId) && (
												<Card>
													<CardHeader>
														<CardTitle>
															{editingAddressId
																? "Edit Address"
																: "Add New Address"}
														</CardTitle>
													</CardHeader>
													<CardContent>
														<Form {...addressForm}>
															<form
																onSubmit={addressForm.handleSubmit(
																	editingAddressId
																		? handleAddressUpdate
																		: handleAddressCreate
																)}
																className="space-y-4"
															>
																<FormField
																	control={
																		addressForm.control
																	}
																	name="address_line_1"
																	render={({
																		field,
																	}) => (
																		<FormItem>
																			<FormLabel>
																				Address
																				Line
																				1
																			</FormLabel>
																			<FormControl>
																				<Input
																					placeholder="Enter address line 1"
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<FormField
																	control={
																		addressForm.control
																	}
																	name="address_line_2"
																	render={({
																		field,
																	}) => (
																		<FormItem>
																			<FormLabel>
																				Address
																				Line
																				2
																				(Optional)
																			</FormLabel>
																			<FormControl>
																				<Input
																					placeholder="Enter address line 2"
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																	<FormField
																		control={
																			addressForm.control
																		}
																		name="city"
																		render={({
																			field,
																		}) => (
																			<FormItem>
																				<FormLabel>
																					City
																				</FormLabel>
																				<FormControl>
																					<Input
																						placeholder="Enter city"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>

																	<FormField
																		control={
																			addressForm.control
																		}
																		name="state"
																		render={({
																			field,
																		}) => (
																			<FormItem>
																				<FormLabel>
																					State
																				</FormLabel>
																				<FormControl>
																					<Input
																						placeholder="Enter state"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>

																	<FormField
																		control={
																			addressForm.control
																		}
																		name="postal_code"
																		render={({
																			field,
																		}) => (
																			<FormItem>
																				<FormLabel>
																					Postal
																					Code
																				</FormLabel>
																				<FormControl>
																					<Input
																						placeholder="Enter postal code"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																</div>

																<FormField
																	control={
																		addressForm.control
																	}
																	name="country"
																	render={({
																		field,
																	}) => (
																		<FormItem>
																			<FormLabel>
																				Country
																			</FormLabel>
																			<FormControl>
																				<Input
																					placeholder="Enter country"
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<div className="flex justify-end space-x-2">
																	<Button
																		type="button"
																		variant="outline"
																		onClick={() => {
																			setShowNewAddressForm(
																				false
																			);
																			setEditingAddressId(
																				null
																			);
																			addressForm.reset();
																		}}
																	>
																		Cancel
																	</Button>
																	<Button
																		type="submit"
																		disabled={
																			isUpdatingAddress
																		}
																	>
																		{isUpdatingAddress
																			? "Saving..."
																			: editingAddressId
																			? "Update Address"
																			: "Add Address"}
																	</Button>
																</div>
															</form>
														</Form>
													</CardContent>
												</Card>
											)}
										</div>
									</TabsContent>
								)}
							</Tabs>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</AuthGuard>
	);
}
