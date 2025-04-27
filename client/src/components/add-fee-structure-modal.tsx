import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertFeeStructureSchema, FeeStructure } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Create a form schema based on the Zod schema with additional validation
const formSchema = insertFeeStructureSchema.extend({
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  lateFee: z.coerce.number().min(0, "Late fee must be a positive number"),
  grade: z.coerce.number().min(1, "Grade must be at least 1").max(12, "Grade must be at most 12"),
});

type FeeStructureFormValues = z.infer<typeof formSchema>;

interface AddFeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFeeStructureModal({ isOpen, onClose }: AddFeeStructureModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      lateFee: 0,
      grade: 1,
    },
  });

  const createFeeStructureMutation = useMutation({
    mutationFn: async (values: FeeStructureFormValues) => {
      const res = await apiRequest("POST", "/api/fee-structures", values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create fee structure");
      }
      return res.json();
    },
    onSuccess: (data: FeeStructure) => {
      queryClient.invalidateQueries({ queryKey: ["/api/fee-structures"] });
      toast({
        title: "Success",
        description: "Fee structure created successfully",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FeeStructureFormValues) => {
    createFeeStructureMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Fee Structure</DialogTitle>
          <DialogDescription>
            Create a new fee structure for a specific grade level.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Term 1 Fee" {...field} />
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
                  <FormControl>
                    <Input type="number" min={1} max={12} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lateFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Fee ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description of this fee structure" 
                      value={field.value || ''} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createFeeStructureMutation.isPending}>
                {createFeeStructureMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Fee Structure
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}