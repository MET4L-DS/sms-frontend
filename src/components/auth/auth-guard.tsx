"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService, UserProfile } from "@/lib/auth";

interface AuthGuardProps {
	children: React.ReactNode;
	allowedRoles?: Array<"ADMIN" | "HOD" | "FACULTY" | "STAFF" | "STUDENT">;
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const token = AuthService.getToken();

			if (!token) {
				router.push("/login");
				return;
			}

			try {
				const userProfile = await AuthService.getProfile(token);
				setUser(userProfile);

				// Check if user role is allowed
				if (
					allowedRoles &&
					!allowedRoles.includes(userProfile.user_type)
				) {
					router.push("/unauthorized");
					return;
				}
			} catch {
				AuthService.removeToken();
				router.push("/login");
				return;
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [router, allowedRoles]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <>{children}</>;
}
