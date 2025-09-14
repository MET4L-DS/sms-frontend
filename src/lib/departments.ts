const API_BASE_URL = "http://localhost/sms/api";

export interface Department {
	department_id: number;
	department_code: string;
	department_name: string;
	hod_name: string;
	hod_email: string;
}

export interface CreateDepartmentRequest {
	department_code: string;
	department_name: string;
	hod_email: string;
}

export interface UpdateDepartmentRequest {
	department_code?: string;
	department_name?: string;
	hod_email?: string;
}

export class DepartmentService {
	private static getAuthHeaders(): HeadersInit {
		const token = localStorage.getItem("auth_token");
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
	}

	static async getDepartments(): Promise<Department[]> {
		const response = await fetch(`${API_BASE_URL}/departments`, {
			headers: this.getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Failed to fetch departments" }));
			throw new Error(JSON.stringify(errorData));
		}

		return response.json();
	}

	static async getDepartment(id: number): Promise<Department> {
		const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
			headers: this.getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Failed to fetch department" }));
			throw new Error(JSON.stringify(errorData));
		}

		return response.json();
	}

	static async createDepartment(
		department: CreateDepartmentRequest
	): Promise<Department> {
		const response = await fetch(`${API_BASE_URL}/departments`, {
			method: "POST",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(department),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Failed to create department" }));
			throw new Error(JSON.stringify(errorData));
		}

		return response.json();
	}

	static async updateDepartment(
		id: number,
		department: UpdateDepartmentRequest
	): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
			method: "PUT",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(department),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Failed to update department" }));
			throw new Error(JSON.stringify(errorData));
		}
	}

	static async deleteDepartment(id: number): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
			method: "DELETE",
			headers: this.getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Failed to delete department" }));
			throw new Error(JSON.stringify(errorData));
		}
	}
}
