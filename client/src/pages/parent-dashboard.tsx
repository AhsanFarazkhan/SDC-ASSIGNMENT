import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/components/navbar";
import StudentCard from "@/components/student-card";
import PaymentHistoryTable from "@/components/payment-history-table";
import PaymentModal from "@/components/payment-modal";
import { Loader2 } from "lucide-react";
import { Student } from "@shared/schema";

export default function ParentDashboard() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students for the logged-in parent
  const { 
    data: students, 
    isLoading: isLoadingStudents,
    error: studentsError
  } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Fetch payment history
  const { 
    data: payments, 
    isLoading: isLoadingPayments 
  } = useQuery({
    queryKey: ["/api/payments"],
  });

  const handlePayNow = (student: Student) => {
    setSelectedStudent(student);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Parent Dashboard Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Parent Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your children's school fees</p>
          </div>

          {/* Children Overview */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {isLoadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : studentsError ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                Error loading students. Please try again.
              </div>
            ) : students && students.length > 0 ? (
              students.map((student) => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                  onPayNow={() => handlePayNow(student)} 
                />
              ))
            ) : (
              <div className="bg-gray-50 p-8 text-center rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">
                  You don't have any students registered. Please contact the school administration.
                </p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payment History</h3>
            {isLoadingPayments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <PaymentHistoryTable payments={payments || []} />
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedStudent && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          student={selectedStudent}
        />
      )}
    </div>
  );
}
