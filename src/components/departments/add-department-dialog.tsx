"use client";

import { useState } from "react";
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
import { DepartmentService, CreateDepartmentRequest } from "@/lib/department";
import { AuthService } from "@/lib/auth";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { toast } from "sonner";

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

interface AddDepartmentDialogProps {
  onDepartmentAdded?: () => void;
}

export function AddDepartmentDialog({
  onDepartmentAdded,
}: AddDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateDepartmentRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department_code: "",
      department_name: "",
      hod_email: "",
    },
  });

  async function onSubmit(values: CreateDepartmentRequest) {
    const token = AuthService.getToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await DepartmentService.createDepartment(token, values);
      toast.success("Department created successfully!");
      form.reset();
      setOpen(false);
      onDepartmentAdded?.();
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to create department"
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Department</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Create a new department. This will also create an HOD account with
            the provided email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      style={{ textTransform: "uppercase" }}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Short code for the department (uppercase letters and numbers
                    only)
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
                  <FormDescription>Full name of the department</FormDescription>
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
                    Email address for the Head of Department (HOD account will
                    be created)
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
                {isLoading ? "Creating..." : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
