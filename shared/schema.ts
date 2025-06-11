import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("staff"),
  department: varchar("department"),
  roles: varchar("roles").array().notNull().default(["user"]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table for contact directory
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").unique().notNull(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  department: varchar("department").notNull(),
  shift: varchar("shift").notNull(),
  seniority: integer("seniority").default(0),
  availability: varchar("availability").default("available"),
  contactMethod: varchar("contact_method").default("email"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coverage requests table
export const coverageRequests = pgTable("coverage_requests", {
  id: serial("id").primaryKey(),
  requestId: varchar("request_id").unique().notNull(),
  employeeId: varchar("employee_id").notNull(),
  shift: varchar("shift").notNull(),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  location: varchar("location").notNull(),
  reason: text("reason"),
  urgency: varchar("urgency").default("normal"),
  status: varchar("status").default("open"),
  coveredBy: varchar("covered_by"),
  responseTime: integer("response_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coverage history for analytics
export const coverageHistory = pgTable("coverage_history", {
  id: serial("id").primaryKey(),
  assignmentId: varchar("assignment_id").unique().notNull(),
  employeeId: varchar("employee_id").notNull(),
  shift: varchar("shift").notNull(),
  approvedById: varchar("approved_by_id"),
  date: timestamp("date").notNull(),
  location: varchar("location").notNull(),
  outcome: varchar("outcome").notNull(),
  responseTime: integer("response_time"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  startTime: varchar("start_time"),
  endTime: varchar("end_time")
});

// Text inputs for scanning
export const textInputs = pgTable("text_inputs", {
  id: serial("id").primaryKey(),
  textId: varchar("text_id").unique().notNull(),
  source: varchar("source").notNull(),
  content: text("content").notNull(),
  sender: varchar("sender"),
  extractedTasks: jsonb("extracted_tasks").default([]),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics metrics
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type").notNull(),
  value: varchar("value").notNull(),
  period: varchar("period").notNull(),
  date: timestamp("date").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

// Code reviews table
export const codeReviews = pgTable("code_reviews", {
  id: varchar("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  findings: jsonb("findings").notNull(),
  reviewedBy: varchar("reviewed_by").notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("pending"),
  priority: varchar("priority").default("medium"),
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  content: text("content").notNull()
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  expiresAt: timestamp("expires_at")
});

// User interface
export interface User {
  id: string;
  roles: string[];
  email?: string;
  name?: string;
}

// Type exports
export type InsertEmployee = typeof employees.$inferInsert;
export type Employee = typeof employees.$inferSelect;

export type InsertCoverageRequest = typeof coverageRequests.$inferInsert;
export type CoverageRequest = typeof coverageRequests.$inferSelect;

export type InsertCoverageHistory = typeof coverageHistory.$inferInsert;
export type CoverageHistory = typeof coverageHistory.$inferSelect;

export type InsertTextInput = typeof textInputs.$inferInsert;
export type TextInput = typeof textInputs.$inferSelect;

export type InsertMetric = typeof metrics.$inferInsert;
export type Metric = typeof metrics.$inferSelect;

export type InsertCodeReview = typeof codeReviews.$inferInsert;
export type CodeReview = typeof codeReviews.$inferSelect;

export type InsertTask = typeof tasks.$inferInsert;
export type Task = typeof tasks.$inferSelect;

export type InsertAnnouncement = typeof announcements.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoverageRequestSchema = createInsertSchema(coverageRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoverageHistorySchema = createInsertSchema(coverageHistory).omit({
  id: true,
  createdAt: true
});

export const insertTaskSchema = createInsertSchema(tasks);
export const insertAnnouncementSchema = createInsertSchema(announcements);

// Final schema export
export const schema = {
  users,
  sessions,
  coverageHistory,
  coverageRequests,
  employees,
  textInputs,
  metrics,
  codeReviews,
  tasks,
  templates,
  announcements,
  insertEmployeeSchema,
  insertCoverageRequestSchema,
  insertCoverageHistorySchema,
  insertTaskSchema,
  insertAnnouncementSchema
};