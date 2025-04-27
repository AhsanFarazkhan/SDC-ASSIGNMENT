import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Student, insertPaymentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Banknote, DollarSign } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Extend payment schema for form validation
const paymentFormSchema = z.object({
  studentId: z.number(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["credit_card", "debit_card", "bank_transfer"]),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  description: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export default function PaymentModal({ isOpen, onClose, student }: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the fee amount from the student's fee structure
  // In a real app, we would fetch the fee structure data properly
  // For now, use a hardcoded amount for demonstration
  const feeAmount = 500; // Default to $500

  // Define form with default values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: student?.id,
      amount: feeAmount,
      paymentMethod: "credit_card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      description: `Term Tuition Fee for ${student?.firstName} ${student?.lastName}`,
    },
  });

  // Watch payment method to conditionally show card details
  const paymentMethod = form.watch("paymentMethod");

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      // Filter out the fields that aren't in the API schema
      const { cardNumber, expiryDate, cvv, paymentMethod, ...paymentData } = values;
      
      // Generate a unique transaction ID
      const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create payment record
      // Remove the ISO string conversion since the server expects a Date object
      const res = await apiRequest("POST", "/api/payments", {
        ...paymentData,
        transactionId,
        status: "pending", // Default status
        // Don't send the dueDate - let the server set a default
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Initiated",
        description: "Your payment is being processed. You'll be notified once it's complete.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/student", student.id] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Could not process payment",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: PaymentFormValues) => {
    createPaymentMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Make Payment
          </DialogTitle>
          <DialogDescription>
            Process fee payment for {student?.firstName} {student?.lastName} (Grade {student?.grade})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} value={student?.id} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-7 pr-12"
                        placeholder="0.00"
                        {...field}
                        disabled
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="credit_card" id="credit_card" className="sr-only" />
                        <Label htmlFor="credit_card" className="cursor-pointer flex flex-col items-center">
                          <CreditCard className="h-6 w-6 mb-2 text-primary" />
                          <span>Credit Card</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="debit_card" id="debit_card" className="sr-only" />
                        <Label htmlFor="debit_card" className="cursor-pointer flex flex-col items-center">
                          <CreditCard className="h-6 w-6 mb-2 text-primary" />
                          <span>Debit Card</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="bank_transfer" id="bank_transfer" className="sr-only" />
                        <Label htmlFor="bank_transfer" className="cursor-pointer flex flex-col items-center">
                          <Banknote className="h-6 w-6 mb-2 text-primary" />
                          <span>Bank Transfer</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXX XXXX XXXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="border rounded-md p-4 bg-gray-50">
                <p className="text-sm text-gray-700 mb-2">
                  Please use the following details for bank transfer:
                </p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Account Name:</span> EduPay School Fees</p>
                  <p><span className="font-medium">Account Number:</span> 1234567890</p>
                  <p><span className="font-medium">Routing Number:</span> 123456789</p>
                  <p><span className="font-medium">Reference:</span> {student?.id}-{student?.firstName}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-secondary hover:bg-secondary-dark"
                disabled={createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Pay ${feeAmount.toFixed(2)}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
