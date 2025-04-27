import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { StatsCard } from "@/components/stats-card";
import StudentTable from "@/components/student-table";
import PaymentsTable from "@/components/payments-table";
import ParentsTable from "@/components/parents-table";
import AddStudentModal from "@/components/add-student-modal";
import GenerateReportModal from "@/components/generate-report-modal";
import FeeStructuresTable from "@/components/fee-structures-table";
import AddFeeStructureModal from "@/components/add-fee-structure-modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserPlusIcon, 
  FileTextIcon,
  SearchIcon,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);
  const [isAddFeeStructureModalOpen, setIsAddFeeStructureModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<{
    totalStudents: string | number;
    totalFeesCollected: number;
    pendingPayments: number;
  }>({
    queryKey: ["/api/stats"],
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage students, fees, and payments</p>
            </div>
            <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
              <Button onClick={() => setIsAddStudentModalOpen(true)}>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button variant="secondary" onClick={() => setIsGenerateReportModalOpen(true)}>
                <FileTextIcon className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatsCard 
              title="Total Students" 
              value={stats?.totalStudents || 0} 
              change={{ value: 12, isIncrease: true }}
              loading={isLoadingStats}
            />
            <StatsCard 
              title="Total Fees Collected" 
              value={stats?.totalFeesCollected?.toFixed(2) || "0.00"} 
              prefix="$" 
              change={{ value: 8.2, isIncrease: true }}
              loading={isLoadingStats}
            />
            <StatsCard 
              title="Pending Payments"
              value={stats?.pendingPayments?.toFixed(2) || "0.00"} 
              prefix="$" 
              change={{ value: 3.5, isIncrease: true }}
              loading={isLoadingStats}
            />
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="border-b border-gray-200 w-full bg-transparent justify-start rounded-none p-0 h-auto">
              <TabsTrigger 
                value="students" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                Students
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                Payments
              </TabsTrigger>
              <TabsTrigger 
                value="parents" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                Parents
              </TabsTrigger>
              <TabsTrigger 
                value="fee-structures" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                Fee Structures
              </TabsTrigger>
            </TabsList>

            {/* Students Tab Content */}
            <TabsContent value="students" className="p-0 border-none">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
                <div className="w-full md:w-64">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search students" 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="1">Grade 1</SelectItem>
                      <SelectItem value="2">Grade 2</SelectItem>
                      <SelectItem value="3">Grade 3</SelectItem>
                      <SelectItem value="4">Grade 4</SelectItem>
                      <SelectItem value="5">Grade 5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Students Table */}
              <StudentTable 
                searchTerm={searchTerm} 
                gradeFilter={gradeFilter} 
                statusFilter={paymentStatusFilter} 
              />
            </TabsContent>

            {/* Payments Tab Content */}
            <TabsContent value="payments" className="p-0 border-none">
              <PaymentsTable />
            </TabsContent>

            {/* Parents Tab Content */}
            <TabsContent value="parents" className="p-0 border-none">
              <ParentsTable />
            </TabsContent>
            
            {/* Fee Structures Tab Content */}
            <TabsContent value="fee-structures" className="p-0 border-none">
              <FeeStructuresTable onAddFeeStructure={() => setIsAddFeeStructureModalOpen(true)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => setIsAddStudentModalOpen(false)} 
      />
      <GenerateReportModal 
        isOpen={isGenerateReportModalOpen} 
        onClose={() => setIsGenerateReportModalOpen(false)} 
      />
      <AddFeeStructureModal
        isOpen={isAddFeeStructureModalOpen}
        onClose={() => setIsAddFeeStructureModalOpen(false)}
      />
    </div>
  );
}
