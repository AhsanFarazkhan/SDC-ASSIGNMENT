import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertStudentSchema, 
  insertPaymentSchema, 
  insertFeeStructureSchema,
  studentsRelations 
} from "@shared/schema";
import { processPaymentQueue, processPayment } from "./utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Middleware to check if the user is authenticated
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Middleware to check if the user is an admin
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  };

  // Get dashboard statistics
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const totalStudents = await storage.getStudentCount();
      const totalFeesCollected = await storage.getTotalFeeCollected();
      const pendingPayments = await storage.getPendingPaymentsTotal();

      res.json({
        totalStudents,
        totalFeesCollected,
        pendingPayments
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Fee structures endpoints
  app.get("/api/fee-structures", requireAuth, async (req, res) => {
    try {
      const feeStructures = await storage.getAllFeeStructures();
      res.json(feeStructures);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      res.status(500).json({ message: "Failed to fetch fee structures" });
    }
  });
  
  app.post("/api/fee-structures", requireAdmin, async (req, res) => {
    try {
      // Validate request data
      const validatedData = insertFeeStructureSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validatedData.error.errors 
        });
      }
      
      // Create fee structure
      const feeStructure = await storage.createFeeStructure(validatedData.data);
      res.status(201).json(feeStructure);
    } catch (error) {
      console.error("Error creating fee structure:", error);
      res.status(500).json({ message: "Failed to create fee structure" });
    }
  });

  // Student endpoints
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      // For parents, only return their own students
      if (req.user.role === 'parent') {
        const students = await storage.getStudentsByParent(req.user.id);
        return res.json(students);
      }
      
      // For admins, return all students
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // For parents, verify they are the parent of the student
      if (req.user.role === 'parent' && student.parentId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", requireAdmin, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertStudentSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validatedData.error.errors 
        });
      }
      
      // Create student
      const student = await storage.createStudent(validatedData.data);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Payment endpoints
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      // For parents, only return their own payments
      if (req.user.role === 'parent') {
        const payments = await storage.getPaymentsByUser(req.user.id);
        return res.json(payments);
      }
      
      // For admins, return all payments
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/student/:id", requireAuth, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // For parents, verify they are the parent of the student
      if (req.user.role === 'parent' && student.parentId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payments = await storage.getPaymentsByStudent(studentId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching student payments:", error);
      res.status(500).json({ message: "Failed to fetch student payments" });
    }
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      // Validate request body
      console.log("Payment request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertPaymentSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        console.log("Payment validation error:", JSON.stringify(validatedData.error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid payment data", 
          errors: validatedData.error.errors 
        });
      }
      
      const { studentId } = validatedData.data;
      
      // Verify student exists
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // For parents, verify they are the parent of the student
      if (req.user.role === 'parent' && student.parentId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Set the user ID to the current user
      const payment = await storage.createPayment({
        ...validatedData.data,
        userId: req.user.id,
      });
      
      // Process payment asynchronously to simulate concurrent operation
      processPaymentQueue.add(() => processPayment(payment.id));
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create payment" 
      });
    }
  });

  // Parents endpoints (admin only)
  app.get("/api/parents", requireAdmin, async (req, res) => {
    try {
      // Get all parent users - filter parent users only
      const allUsers = await Promise.all(
        (await storage.getAllUsers()).filter(user => user.role === 'parent')
      );
      
      // Get all students to count per parent
      const allStudents = await storage.getAllStudents();
      
      // Count students per parent
      const studentCountMap = new Map();
      for (const student of allStudents) {
        if (student.parentId) {
          const count = studentCountMap.get(student.parentId) || 0;
          studentCountMap.set(student.parentId, count + 1);
        }
      }
      
      // Return parents with student counts
      const parentsWithStudentCount = allUsers.map(parent => ({
        ...parent,
        studentCount: studentCountMap.get(parent.id) || 0
      }));
      
      res.json(parentsWithStudentCount);
    } catch (error) {
      console.error("Error fetching parents:", error);
      res.status(500).json({ message: "Failed to fetch parents" });
    }
  });

  // Generate reports (admin only)
  app.post("/api/reports/generate", requireAdmin, async (req, res) => {
    try {
      const { reportType, dateRange, startDate, endDate, format } = req.body;
      
      // Validate request data
      if (!reportType || !dateRange || !format) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // In a real application, this would generate an actual report
      // For this demo, we'll just return a success message
      
      // Simulate report generation (would take time in real app)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({ 
        success: true,
        message: "Report generated successfully",
        reportType,
        dateRange,
        format
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  return httpServer;
}
