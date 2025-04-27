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
  Loader2
} from "lucide-react";
import { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ParentWithStudentCount extends User {
  studentCount: number;
  totalDue?: number;
  status?: string;
}

export default function ParentsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { 
    data: parents, 
    isLoading, 
    error 
  } = useQuery<ParentWithStudentCount[]>({
    queryKey: ["/api/parents"],
  });

  // Calculate pagination
  const totalPages = Math.ceil((parents?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParents = parents?.slice(startIndex, endIndex) || [];

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
        Error loading parents. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Total Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentParents.length > 0 ? (
              currentParents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {getInitials(parent.name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                        <div className="text-sm text-gray-500">Joined: {formatJoinDate(parent.createdAt)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{parent.email}</div>
                    <div className="text-sm text-gray-500">+1 (555) {100 + parent.id}-{1000 + parent.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{parent.studentCount} student(s)</div>
                    {/* Placeholder for actual student names */}
                    <div className="text-sm text-gray-500">
                      {getPlaceholderChildren(parent.id, parent.name)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-900">
                    ${getDueAmount(parent.id).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDueAmount(parent.id) > 0 ? "warning" : "success"}>
                      {getDueAmount(parent.id) > 0 ? "Payment pending" : "Up to date"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No parents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(parents?.length || 0) > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, parents?.length || 0)}
              </span>{" "}
              of <span className="font-medium">{parents?.length}</span> results
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
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
}

function formatJoinDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getPlaceholderChildren(parentId: number, parentName: string): string {
  // In a real app, this would use actual student data
  // For this demo, we'll create some placeholders
  const lastName = parentName.split(' ').pop() || '';
  const firstNames = ['Emily', 'Michael', 'Sofia', 'Jack', 'Olivia', 'Daniel'];
  const firstNameIndex = parentId % firstNames.length;
  const grades = [1, 2, 3, 4, 5];
  const grade = grades[parentId % grades.length];
  
  return `${firstNames[firstNameIndex]} ${lastName} (Grade ${grade})`;
}

function getDueAmount(parentId: number): number {
  // In a real app, this would be calculated from actual payment data
  // For this demo, we'll use the parent ID to determine a value
  const amounts = [0, 950, 850, 0, 1200];
  return amounts[parentId % amounts.length];
}
