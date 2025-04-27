import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FileTextIcon,
  Loader2
} from "lucide-react";
import { Payment, PaymentWithRelations } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function PaymentsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { 
    data: payments, 
    isLoading, 
    error 
  } = useQuery<PaymentWithRelations[]>({
    queryKey: ["/api/payments"],
  });

  // Calculate pagination
  const totalPages = Math.ceil((payments?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments?.slice(startIndex, endIndex) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        Error loading payments. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPayments.length > 0 ? (
              currentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm text-gray-500">
                    {payment.transactionId}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {payment.student?.firstName} {payment.student?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Grade {payment.student?.grade}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{payment.user?.name}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(payment.paymentDate)}
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(payments?.length || 0) > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, payments?.length || 0)}
              </span>{" "}
              of <span className="font-medium">{payments?.length}</span> results
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="ml-3"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
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
