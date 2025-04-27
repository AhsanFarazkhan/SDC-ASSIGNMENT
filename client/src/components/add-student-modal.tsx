import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Student, insertStudentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Fallback fee structures
const FALLBACK_FEE_STRUCTURES = [
  { id: 1, name: "Grade 1 Term Fee", amount: 500, grade: 1 },
  { id: 2, name: "Grade 2 Term Fee", amount: 600, grade: 2 },
  { id: 3, name: "Grade 3 Term Fee", amount: 700, grade: 3 },
];

// Extend the student schema for form validation
const formSchema = insertStudentSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  grade: z.coerce.number().min(1, "Grade must be at least 1").max(12, "Grade must be at most 12"),
  parentId: z.coerce.number().min(1, "Parent is required"),
  feeStructureId: z.coerce.number().min(1, "Fee structure is required"),
});

type StudentFormValues = z.infer<typeof formSchema>;

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for fee structures
  const [feeStructures, setFeeStructures] = useState(FALLBACK_FEE_STRUCTURES);
  const [isLoadingFeeStructures, setIsLoadingFeeStructures] = useState(false);

  // Fetch parents for dropdown
  const { data: parents, isLoading: isLoadingParents } = useQuery({
    queryKey: ["/api/parents"],
    enabled: isOpen,
  });

  // Fetch fee structures directly
  useEffect(() => {
    async function fetchFeeStructures() {
      if (!isOpen) return;
      
      setIsLoadingFeeStructures(true);
      try {
        const response = await fetch('/api/fee-structures');
        if (response.ok) {
          const data = await response.json();
          console.log("Fee structures fetched:", data);
          if (data && data.length > 0) {
            setFeeStructures(data);
          }
        } else {
          console.error("Failed to fetch fee structures");
        }
      } catch (error) {
        console.error("Error fetching fee structures:", error);
      } finally {
        setIsLoadingFeeStructures(false);
      }
    }
    
    fetchFeeStructures();
  }, [isOpen]);

  // Define form with default values
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      grade: undefined,
      parentId: undefined,
      feeStructureId: undefined,
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const res = await apiRequest("POST", "/api/students", values);
      return res.json();
    },
    onSuccess: (data: Student) => {
      toast({
        title: "Student Added",
        description: `${data.firstName} ${data.lastName} has been added successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not add student",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: StudentFormValues) => {
    createStudentMutation.mutate(values);
  };

  // Grade options
  const gradeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2 text-primary" />
            Add New Student
          </DialogTitle>
          <DialogDescription>
            Add a new student to the system. Students must be associated with a registered parent.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingParents ? (
                        <div className="p-2 flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : !parents || parents.length === 0 ? (
                        <SelectItem value="none" disabled>No parents available</SelectItem>
                      ) : (
                        parents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id.toString()}>
                            {parent.name} ({parent.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feeStructureId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Structure</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee structure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFeeStructures ? (
                        <div className="p-2 flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        feeStructures.map((feeStructure) => (
                          <SelectItem 
                            key={feeStructure.id} 
                            value={feeStructure.id.toString()}
                          >
                            {feeStructure.name} - ${feeStructure.amount}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createStudentMutation.isPending}
              >
                {createStudentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Student
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}