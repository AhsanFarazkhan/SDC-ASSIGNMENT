import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const userRoleEnum = pgEnum('user_role', ['admin', 'parent']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('parent'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  payments: many(payments),
}));

// Student model
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: integer("grade").notNull(),
  parentId: integer("parent_id").references(() => users.id, { onDelete: 'cascade' }),
  feeStructureId: integer("fee_structure_id").references(() => feeStructures.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(users, {
    fields: [students.parentId],
    references: [users.id],
  }),
  feeStructure: one(feeStructures, {
    fields: [students.feeStructureId],
    references: [feeStructures.id],
  }),
  payments: many(payments),
}));

// Fee Structure model
export const feeStructures = pgTable("fee_structures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  amount: doublePrecision("amount").notNull(),
  lateFee: doublePrecision("late_fee").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feeStructuresRelations = relations(feeStructures, ({ many }) => ({
  students: many(students),
}));

// Payment Status model
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed']);

// Payment model
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: doublePrecision("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default('pending'),
  studentId: integer("student_id").references(() => students.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  description: text("description"),
  paymentDate: timestamp("payment_date").defaultNow(),
  dueDate: timestamp("due_date"),
  processedAt: timestamp("processed_at"),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  })
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(users);

export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const selectStudentSchema = createSelectSchema(students);

export const insertFeeStructureSchema = createInsertSchema(feeStructures).omit({ id: true, createdAt: true });
export const selectFeeStructureSchema = createSelectSchema(feeStructures);

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true, processedAt: true });
export const selectPaymentSchema = createSelectSchema(payments);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type StudentWithRelations = Student & { 
  parent?: User,
  feeStructure?: FeeStructure
};

export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type FeeStructure = typeof feeStructures.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type PaymentWithRelations = Payment & {
  student?: Student,
  user?: User
};
