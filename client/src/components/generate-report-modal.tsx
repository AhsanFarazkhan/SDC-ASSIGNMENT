import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, FileBarChart } from "lucide-react";
import { useState } from "react";

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

// Define report generation schema
const reportFormSchema = z.object({
  reportType: z.enum(["payment_summary", "outstanding_fees", "student_enrollment"]),
  dateRange: z.enum(["current_term", "previous_term", "current_year", "custom"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(["pdf", "excel", "csv"]),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerateReportModal({ isOpen, onClose }: GenerateReportModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Define form with default values
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "payment_summary",
      dateRange: "current_term",
      format: "pdf",
    },
  });

  // Watch dateRange to conditionally show custom date inputs
  const dateRange = form.watch("dateRange");
  const showCustomDateRange = dateRange === "custom";

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      const res = await apiRequest("POST", "/api/reports/generate", values);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your report is ready for download.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not generate report",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ReportFormValues) => {
    // Simulate report generation with a slight delay
    setIsGenerating(true);
    generateReportMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileBarChart className="h-5 w-5 mr-2 text-primary" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            Create a detailed report for school fee management and analysis.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="payment_summary">Payment Summary</SelectItem>
                      <SelectItem value="outstanding_fees">Outstanding Fees</SelectItem>
                      <SelectItem value="student_enrollment">Student Enrollment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Range</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="current_term">Current Term</SelectItem>
                      <SelectItem value="previous_term">Previous Term</SelectItem>
                      <SelectItem value="current_year">Current Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCustomDateRange && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={generateReportMutation.isPending || isGenerating}
              >
                {(generateReportMutation.isPending || isGenerating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
