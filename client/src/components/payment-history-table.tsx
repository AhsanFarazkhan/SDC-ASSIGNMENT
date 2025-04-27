import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { Payment, PaymentWithRelations } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface PaymentHistoryTableProps {
  payments: PaymentWithRelations[];
}

export default function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (!payments.length) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
        <p className="text-gray-500">No payment history available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-sm text-gray-500">
                  {payment.transactionId}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {payment.student?.firstName} {payment.student?.lastName}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {payment.description || `Term ${getTermNumber(payment.paymentDate)} Tuition Fees`}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(payment.paymentDate)}
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-900">
                  ${payment.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(payment.status)}>
                    {formatStatus(payment.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <FileTextIcon className="h-4 w-4 mr-1" />
                    {payment.status === 'completed' ? 'View Receipt' : 'View Details'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusVariant(status: string): "default" | "success" | "warning" | "destructive" {
  switch (status.toLowerCase()) {
    case 'completed':
      return "success";
    case 'pending':
    case 'processing':
      return "warning";
    case 'failed':
      return "destructive";
    default:
      return "default";
  }
}

function getTermNumber(dateString: string | Date | null | undefined): number {
  if (!dateString) return 1;
  
  const date = new Date(dateString);
  const month = date.getMonth();
  
  // Simple term calculation based on month
  if (month >= 0 && month <= 3) return 1;
  if (month >= 4 && month <= 7) return 2;
  return 3;
}
