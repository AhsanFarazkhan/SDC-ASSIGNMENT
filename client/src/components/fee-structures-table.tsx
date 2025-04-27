import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit, Trash2, Loader2 } from "lucide-react";
import { FeeStructure } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface FeeStructuresTableProps {
  onAddFeeStructure?: () => void;
}

export default function FeeStructuresTable({ onAddFeeStructure }: FeeStructuresTableProps) {

  const { data: feeStructures, isLoading } = useQuery<FeeStructure[]>({
    queryKey: ["/api/fee-structures"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fee Structures</h2>
        <Button onClick={onAddFeeStructure}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Fee Structure
        </Button>
      </div>

      <Table>
        <TableCaption>A list of all fee structures.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Late Fee</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeStructures && feeStructures.length > 0 ? (
            feeStructures.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">{fee.name}</TableCell>
                <TableCell>Grade {fee.grade}</TableCell>
                <TableCell>${fee.amount.toFixed(2)}</TableCell>
                <TableCell>${fee.lateFee.toFixed(2)}</TableCell>
                <TableCell className="max-w-xs truncate">{fee.description}</TableCell>
                <TableCell>{formatDate(fee.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No fee structures found. Create one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Modal is now handled in the admin dashboard */}
    </div>
  );
}