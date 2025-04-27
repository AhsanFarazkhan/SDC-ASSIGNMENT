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
  Eye, 
  Edit,
  Loader2
} from "lucide-react";
import { Student, StudentWithRelations } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface StudentTableProps {
  searchTerm?: string;
  gradeFilter?: string;
  statusFilter?: string;
}

export default function StudentTable({ 
  searchTerm = "", 
  gradeFilter = "", 
  statusFilter = "" 
}: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: students, isLoading, error } = useQuery<StudentWithRelations[]>({
    queryKey: ["/api/students"],
  });

  // Filter students based on search term and filters
  const filteredStudents = students?.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase());
    
    const matchesGrade = !gradeFilter || gradeFilter === "all" || 
      student.grade.toString() === gradeFilter;
    
    // Add payment status filtering logic when it's available
    const matchesStatus = !statusFilter || statusFilter === "all" || 
      getFeeStatus(student).toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesGrade && matchesStatus;
  }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

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
        Error loading students. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{student.parent?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{student.parent?.email || ''}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">Grade {student.grade}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(getFeeStatus(student))}>
                      {getFeeStatus(student)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono text-gray-900">
                      ${student.feeStructure?.amount.toFixed(2) || '0.00'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {getDueDate(student)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No students found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, filteredStudents.length)}
              </span>{" "}
              of <span className="font-medium">{filteredStudents.length}</span> results
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
function getFeeStatus(student: Student): string {
  // This would be determined by the latest payment data
  // For now, we'll randomly assign a status for demo purposes
  const statuses = ['Paid', 'Pending', 'Overdue'];
  return statuses[student.id % 3];
}

function getStatusVariant(status: string): "default" | "success" | "warning" | "destructive" {
  switch (status.toLowerCase()) {
    case 'paid':
      return "success";
    case 'pending':
      return "warning";
    case 'overdue':
      return "destructive";
    default:
      return "default";
  }
}

function getDueDate(student: Student): string {
  // For demo purposes
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = 15 + (student.id % 15);
  const month = months[student.id % 12];
  return `${month} ${day}, 2023`;
}
