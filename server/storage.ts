import { users, students, feeStructures, payments, type User, type InsertUser, type InsertStudent, type Student, type FeeStructure, type InsertFeeStructure, type Payment, type InsertPayment, PaymentWithRelations, StudentWithRelations } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt, or, inArray, SQL, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Student operations
  getStudent(id: number): Promise<StudentWithRelations | undefined>;
  getStudentsByParent(parentId: number): Promise<StudentWithRelations[]>;
  getAllStudents(): Promise<StudentWithRelations[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Fee Structure operations
  getFeeStructure(id: number): Promise<FeeStructure | undefined>;
  getAllFeeStructures(): Promise<FeeStructure[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  
  // Payment operations
  getPayment(id: number): Promise<PaymentWithRelations | undefined>;
  getPaymentsByUser(userId: number): Promise<PaymentWithRelations[]>;
  getPaymentsByStudent(studentId: number): Promise<PaymentWithRelations[]>;
  getAllPayments(): Promise<PaymentWithRelations[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<Payment | undefined>;
  
  // Dashboard statistics
  getStudentCount(): Promise<number>;
  getTotalFeeCollected(): Promise<number>;
  getPendingPaymentsTotal(): Promise<number>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.id);
  }

  // Student Operations
  async getStudent(id: number): Promise<StudentWithRelations | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    
    if (!student) return undefined;
    
    // Get related data
    const [parent] = student.parentId ? await db.select().from(users).where(eq(users.id, student.parentId)) : [];
    const [feeStructure] = student.feeStructureId ? await db.select().from(feeStructures).where(eq(feeStructures.id, student.feeStructureId)) : [];
    
    return {
      ...student,
      parent,
      feeStructure
    };
  }

  async getStudentsByParent(parentId: number): Promise<StudentWithRelations[]> {
    const studentsList = await db
      .select()
      .from(students)
      .where(eq(students.parentId, parentId));
    
    // Get fee structures for all students
    const feeStructureIds = studentsList
      .filter(s => s.feeStructureId !== null)
      .map(s => s.feeStructureId as number);
    
    let feeStructuresList: FeeStructure[] = [];
    
    if (feeStructureIds.length > 0) {
      feeStructuresList = await db
        .select()
        .from(feeStructures)
        .where(inArray(feeStructures.id, feeStructureIds));
    }
    
    // Create a map for quick lookups
    const feeStructureMap = new Map(
      feeStructuresList.map(fs => [fs.id, fs])
    );
    
    // Return students with their fee structures
    return studentsList.map(student => ({
      ...student,
      feeStructure: student.feeStructureId 
        ? feeStructureMap.get(student.feeStructureId) 
        : undefined
    }));
  }

  async getAllStudents(): Promise<StudentWithRelations[]> {
    const studentsList = await db
      .select()
      .from(students)
      .orderBy(students.id);
    
    // Get all parent IDs and fee structure IDs
    const parentIds = studentsList
      .filter(s => s.parentId !== null)
      .map(s => s.parentId as number);
    
    const feeStructureIds = studentsList
      .filter(s => s.feeStructureId !== null)
      .map(s => s.feeStructureId as number);
    
    // Fetch related data
    let parentsList: User[] = [];
    if (parentIds.length > 0) {
      parentsList = await db
        .select()
        .from(users)
        .where(inArray(users.id, parentIds));
    }
    
    let feeStructuresList: FeeStructure[] = [];
    if (feeStructureIds.length > 0) {
      feeStructuresList = await db
        .select()
        .from(feeStructures)
        .where(inArray(feeStructures.id, feeStructureIds));
    }
    
    // Create maps for quick lookups
    const parentMap = new Map(
      parentsList.map(p => [p.id, p])
    );
    
    const feeStructureMap = new Map(
      feeStructuresList.map(fs => [fs.id, fs])
    );
    
    // Return students with related data
    return studentsList.map(student => ({
      ...student,
      parent: student.parentId 
        ? parentMap.get(student.parentId) 
        : undefined,
      feeStructure: student.feeStructureId 
        ? feeStructureMap.get(student.feeStructureId) 
        : undefined
    }));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    
    return student;
  }

  // Fee Structure Operations
  async getFeeStructure(id: number): Promise<FeeStructure | undefined> {
    const [feeStructure] = await db
      .select()
      .from(feeStructures)
      .where(eq(feeStructures.id, id));
    
    return feeStructure;
  }

  async getAllFeeStructures(): Promise<FeeStructure[]> {
    return await db
      .select()
      .from(feeStructures)
      .orderBy(feeStructures.id);
  }

  async createFeeStructure(insertFeeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const [feeStructure] = await db
      .insert(feeStructures)
      .values(insertFeeStructure)
      .returning();
    
    return feeStructure;
  }

  // Payment Operations
  async getPayment(id: number): Promise<PaymentWithRelations | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    
    if (!payment) return undefined;
    
    // Get related data
    const [student] = payment.studentId 
      ? await db.select().from(students).where(eq(students.id, payment.studentId)) 
      : [];
    
    const [user] = payment.userId 
      ? await db.select().from(users).where(eq(users.id, payment.userId)) 
      : [];
    
    return {
      ...payment,
      student,
      user
    };
  }

  async getPaymentsByUser(userId: number): Promise<PaymentWithRelations[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate));
    
    // Get all student IDs
    const studentIds = paymentsList
      .filter(p => p.studentId !== null)
      .map(p => p.studentId as number);
    
    // Fetch students data
    let studentsList: Student[] = [];
    if (studentIds.length > 0) {
      studentsList = await db
        .select()
        .from(students)
        .where(inArray(students.id, studentIds));
    }
    
    // Create a map for quick lookups
    const studentMap = new Map(
      studentsList.map(s => [s.id, s])
    );
    
    // Return payments with related data
    return paymentsList.map(payment => ({
      ...payment,
      student: payment.studentId 
        ? studentMap.get(payment.studentId) 
        : undefined
    }));
  }

  async getPaymentsByStudent(studentId: number): Promise<PaymentWithRelations[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.studentId, studentId))
      .orderBy(desc(payments.paymentDate));
    
    // Get student and user info
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));
    
    // Get user IDs
    const userIds = paymentsList
      .filter(p => p.userId !== null)
      .map(p => p.userId as number);
    
    // Fetch users data
    let usersList: User[] = [];
    if (userIds.length > 0) {
      usersList = await db
        .select()
        .from(users)
        .where(inArray(users.id, userIds));
    }
    
    // Create a map for quick lookups
    const userMap = new Map(
      usersList.map(u => [u.id, u])
    );
    
    // Return payments with related data
    return paymentsList.map(payment => ({
      ...payment,
      student,
      user: payment.userId 
        ? userMap.get(payment.userId) 
        : undefined
    }));
  }

  async getAllPayments(): Promise<PaymentWithRelations[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .orderBy(desc(payments.paymentDate));
    
    // Get all student and user IDs
    const studentIds = paymentsList
      .filter(p => p.studentId !== null)
      .map(p => p.studentId as number);
    
    const userIds = paymentsList
      .filter(p => p.userId !== null)
      .map(p => p.userId as number);
    
    // Fetch related data
    let studentsList: Student[] = [];
    if (studentIds.length > 0) {
      studentsList = await db
        .select()
        .from(students)
        .where(inArray(students.id, studentIds));
    }
    
    let usersList: User[] = [];
    if (userIds.length > 0) {
      usersList = await db
        .select()
        .from(users)
        .where(inArray(users.id, userIds));
    }
    
    // Create maps for quick lookups
    const studentMap = new Map(
      studentsList.map(s => [s.id, s])
    );
    
    const userMap = new Map(
      usersList.map(u => [u.id, u])
    );
    
    // Return payments with related data
    return paymentsList.map(payment => ({
      ...payment,
      student: payment.studentId 
        ? studentMap.get(payment.studentId) 
        : undefined,
      user: payment.userId 
        ? userMap.get(payment.userId) 
        : undefined
    }));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    // Generate a unique transaction ID if not provided
    const paymentData = {
      ...insertPayment,
      transactionId: insertPayment.transactionId || `TRX${nanoid(8).toUpperCase()}`
    };
    
    // Use a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Check if a payment with this transaction ID already exists
      const [existingPayment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.transactionId, paymentData.transactionId));
      
      if (existingPayment) {
        throw new Error("Payment with this transaction ID already exists");
      }
      
      // Create the payment
      const [payment] = await tx
        .insert(payments)
        .values(paymentData)
        .returning();
      
      return payment;
    });
    
    return result;
  }

  async updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<Payment | undefined> {
    const now = processedAt || new Date();
    
    // Use a transaction to ensure data consistency
    const [updatedPayment] = await db.transaction(async (tx) => {
      // First, get the current payment to check its status
      const [currentPayment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, id));
      
      if (!currentPayment) {
        return [];
      }
      
      // Update the payment status
      return await tx
        .update(payments)
        .set({ 
          status: status as any,
          processedAt: status === 'completed' || status === 'failed' ? now : null
        })
        .where(eq(payments.id, id))
        .returning();
    });
    
    return updatedPayment;
  }

  // Dashboard Statistics
  async getStudentCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(${students.id})` })
      .from(students);
    
    return result[0]?.count || 0;
  }

  async getTotalFeeCollected(): Promise<number> {
    const result = await db
      .select({ sum: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(eq(payments.status, 'completed'));
    
    return result[0]?.sum || 0;
  }

  async getPendingPaymentsTotal(): Promise<number> {
    const result = await db
      .select({ sum: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(
        or(
          eq(payments.status, 'pending'),
          eq(payments.status, 'processing')
        )
      );
    
    return result[0]?.sum || 0;
  }
}

export const storage = new DatabaseStorage();