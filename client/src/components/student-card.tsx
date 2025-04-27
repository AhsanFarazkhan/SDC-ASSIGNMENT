import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Student, FeeStructure } from "@shared/schema";
import { Receipt, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface StudentCardProps {
  student: Student;
  onPayNow: () => void;
}

export default function StudentCard({ student, onPayNow }: StudentCardProps) {
  // Fetch payment history for the student
  const { data: payments } = useQuery({
    queryKey: ["/api/payments/student", student.id],
    enabled: !!student.id,
  });

  const lastPayment = payments && payments.length > 0 ? payments[0] : null;
  const feeStatus = getFeeStatus(student, lastPayment);
  
  return (
    <Card className="bg-white overflow-hidden shadow-sm rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                Grade {student.grade} | ID: {student.id}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge variant={getStatusVariant(feeStatus)}>
              {feeStatus}
            </Badge>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Term Fee</dt>
              <dd className="mt-1 text-lg font-medium text-gray-900 font-mono">
                ${student.feeStructure?.amount.toFixed(2) || '0.00'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
              <dd className={`mt-1 text-lg font-medium ${getStatusTextColor(feeStatus)}`}>
                {getPaymentStatusText(feeStatus, lastPayment)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Next Term Fee Due</dt>
              <dd className="mt-1 text-lg font-medium text-gray-900">
                {getNextDueDate()}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4">
            {feeStatus !== 'Fees Paid' && (
              <Button onClick={onPayNow} className="inline-flex items-center">
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Pay Now
              </Button>
            )}
            <Button variant="outline" className="mt-3 sm:mt-0">
              <Receipt className="h-4 w-4 mr-2" />
              View Payment History
            </Button>
            <Button variant="outline" className="mt-3 sm:mt-0">
              <FileText className="h-4 w-4 mr-2" />
              View Fee Structure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getFeeStatus(student: Student, lastPayment: any): 'Fees Paid' | 'Payment Due' | 'Payment Overdue' {
  if (!lastPayment) return 'Payment Due';
  
  // Check if the last payment was completed and for the current term
  if (lastPayment.status === 'completed') {
    // In a real app, you would check if this payment was for the current term
    return 'Fees Paid';
  }
  
  // Check if payment is overdue based on due date
  const dueDate = lastPayment.dueDate ? new Date(lastPayment.dueDate) : null;
  if (dueDate && dueDate < new Date()) {
    return 'Payment Overdue';
  }
  
  return 'Payment Due';
}

function getStatusVariant(status: string): "default" | "success" | "warning" | "destructive" {
  switch (status) {
    case 'Fees Paid':
      return "success";
    case 'Payment Due':
      return "warning";
    case 'Payment Overdue':
      return "destructive";
    default:
      return "default";
  }
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case 'Fees Paid':
      return "text-green-600";
    case 'Payment Due':
      return "text-amber-600";
    case 'Payment Overdue':
      return "text-red-600";
    default:
      return "text-gray-900";
  }
}

function getPaymentStatusText(status: string, lastPayment: any): string {
  if (status === 'Fees Paid' && lastPayment) {
    return `Paid on ${formatDate(lastPayment.paymentDate)}`;
  } else if (status === 'Payment Due' && lastPayment?.dueDate) {
    return `Due by ${formatDate(lastPayment.dueDate)}`;
  } else if (status === 'Payment Overdue' && lastPayment?.dueDate) {
    return `Overdue since ${formatDate(lastPayment.dueDate)}`;
  }
  
  return status;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getNextDueDate(): string {
  // In a real app, this would be calculated based on the school's term schedule
  // For this demo, we'll just return a fixed date
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 4, 15);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[nextMonth.getMonth()]} ${nextMonth.getDate()}, ${nextMonth.getFullYear()}`;
}
