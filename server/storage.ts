import {
  users,
  employees,
  tasks,
  coverageRequests,
  templates,
  announcements,
  textInputs,
  coverageHistory,
  metrics,
  type User,
  type UpsertUser,
  type Employee,
  type InsertEmployee,
  type Task,
  type InsertTask,
  type CoverageRequest,
  type InsertCoverageRequest,
  type Template,
  type InsertTemplate,
  type Announcement,
  type InsertAnnouncement,
  type TextInput,
  type InsertTextInput,
  type CoverageHistoryRecord,
  type InsertCoverageHistory,
  type Metric,
  type InsertMetric,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<void>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Coverage request operations
  getCoverageRequests(): Promise<CoverageRequest[]>;
  getCoverageRequest(id: number): Promise<CoverageRequest | undefined>;
  createCoverageRequest(request: InsertCoverageRequest): Promise<CoverageRequest>;
  updateCoverageRequest(id: number, updates: Partial<InsertCoverageRequest>): Promise<CoverageRequest | undefined>;
  deleteCoverageRequest(id: number): Promise<void>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<void>;

  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;

  // Text input operations
  getTextInputs(): Promise<TextInput[]>;
  createTextInput(textInput: InsertTextInput): Promise<TextInput>;
  processTextInput(content: string, source: string): Promise<any>;

  // Analytics operations
  getDashboardStats(): Promise<any>;
  getAnalyticsMetrics(): Promise<any>;
  getCoverageHistory(): Promise<CoverageHistoryRecord[]>;
  createCoverageHistory(history: InsertCoverageHistory): Promise<CoverageHistoryRecord>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values({
        ...employee,
        employeeId: employee.employeeId || `EMP${Date.now()}`,
      })
      .returning();
    return newEmployee;
  }

  async updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        taskId: task.taskId || `TASK${Date.now()}`,
      })
      .returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Coverage request operations
  async getCoverageRequests(): Promise<CoverageRequest[]> {
    return await db.select().from(coverageRequests).orderBy(desc(coverageRequests.createdAt));
  }

  async getCoverageRequest(id: number): Promise<CoverageRequest | undefined> {
    const [request] = await db.select().from(coverageRequests).where(eq(coverageRequests.id, id));
    return request;
  }

  async createCoverageRequest(request: InsertCoverageRequest): Promise<CoverageRequest> {
    const [newRequest] = await db
      .insert(coverageRequests)
      .values({
        ...request,
        requestId: request.requestId || `COV${Date.now()}`,
      })
      .returning();
    return newRequest;
  }

  async updateCoverageRequest(id: number, updates: Partial<InsertCoverageRequest>): Promise<CoverageRequest | undefined> {
    const [updatedRequest] = await db
      .update(coverageRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(coverageRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteCoverageRequest(id: number): Promise<void> {
    await db.delete(coverageRequests).where(eq(coverageRequests.id, id));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values({
        ...template,
        templateId: template.templateId || `TPL${Date.now()}`,
      })
      .returning();
    return newTemplate;
  }

  async updateTemplate(id: number, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    const [updatedTemplate] = await db
      .update(templates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        ...announcement,
        announcementId: announcement.announcementId || `ANN${Date.now()}`,
      })
      .returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Text input operations
  async getTextInputs(): Promise<TextInput[]> {
    return await db.select().from(textInputs).orderBy(desc(textInputs.createdAt));
  }

  async createTextInput(textInput: InsertTextInput): Promise<TextInput> {
    const [newTextInput] = await db
      .insert(textInputs)
      .values({
        ...textInput,
        textId: textInput.textId || `TXT${Date.now()}`,
      })
      .returning();
    return newTextInput;
  }

  async processTextInput(content: string, source: string): Promise<any> {
    // Create text input record
    const textInput = await this.createTextInput({
      textId: `TXT${Date.now()}`,
      source,
      content,
      sender: "unknown",
      extractedTasks: [],
      processed: false,
    });

    // Basic task extraction logic (in production, this would use NLP/AI)
    const extractedTasks = [];
    const keywords = ['clean', 'repair', 'fix', 'replace', 'maintain', 'inspect', 'update'];
    const locations = ['building a', 'building b', 'floor', 'room', 'lobby', 'elevator', 'restroom'];
    const priorities = ['urgent', 'asap', 'immediately', 'priority', 'important'];

    // Simple keyword-based extraction
    const lowerContent = content.toLowerCase();
    
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      const task = {
        title: content.split('.')[0] || content.substring(0, 50),
        description: content,
        priority: priorities.some(p => lowerContent.includes(p)) ? 'high' : 'medium',
        location: locations.find(loc => lowerContent.includes(loc)) || 'Not specified',
        deadline: null,
        source: source
      };
      extractedTasks.push(task);
    }

    // Update the text input with extracted tasks
    await db
      .update(textInputs)
      .set({
        extractedTasks: extractedTasks,
        processed: true,
      })
      .where(eq(textInputs.id, textInput.id));

    return { extractedTasks, textInputId: textInput.id };
  }

  // Analytics operations
  async getDashboardStats(): Promise<any> {
    const [employeeCount] = await db.select({ count: count() }).from(employees);
    const [taskStats] = await db.select({ 
      total: count(),
      active: count(sql`CASE WHEN status IN ('pending', 'in_progress') THEN 1 END`),
      completed: count(sql`CASE WHEN status = 'completed' THEN 1 END`)
    }).from(tasks);
    
    const [coverageStats] = await db.select({
      total: count(),
      open: count(sql`CASE WHEN status = 'open' THEN 1 END`)
    }).from(coverageRequests);

    const completionRate = taskStats.total > 0 
      ? Math.round((taskStats.completed / taskStats.total) * 100) 
      : 0;

    return {
      totalEmployees: employeeCount.count || 0,
      activeTasks: taskStats.active || 0,
      coverageRequests: coverageStats.open || 0,
      completionRate: completionRate,
      employeeGrowth: 5.2, // This would be calculated from historical data
      taskChange: -2.1,
      coverageChange: 0,
      completionChange: 1.8,
      recentActivity: [] // This would fetch recent activity records
    };
  }

  async getAnalyticsMetrics(): Promise<any> {
    const [taskCompletionStats] = await db.select({
      total: count(),
      completed: count(sql`CASE WHEN status = 'completed' THEN 1 END`)
    }).from(tasks);

    const [coverageStats] = await db.select({
      total: count(),
      covered: count(sql`CASE WHEN status = 'covered' THEN 1 END`)
    }).from(coverageRequests);

    const taskCompletionRate = taskCompletionStats.total > 0 
      ? Math.round((taskCompletionStats.completed / taskCompletionStats.total) * 100)
      : 0;

    const coverageSuccessRate = coverageStats.total > 0
      ? Math.round((coverageStats.covered / coverageStats.total) * 100)
      : 0;

    return {
      taskCompletionRate: taskCompletionRate,
      avgResponseTime: 2.3, // This would be calculated from actual response times
      employeeUtilization: 87, // This would be calculated from work hours data
      coverageSuccessRate: coverageSuccessRate,
      taskCompletionTrend: 15,
      responseTimeTrend: -15,
      utilizationTrend: 3,
      coverageTrend: 3,
      departmentPerformance: [
        { name: "Housekeeping", performance: 96, color: "bg-green-500" },
        { name: "Maintenance", performance: 89, color: "bg-yellow-500" },
        { name: "Security", performance: 92, color: "bg-blue-500" },
        { name: "Facilities", performance: 85, color: "bg-purple-500" },
      ]
    };
  }

  async getCoverageHistory(): Promise<CoverageHistoryRecord[]> {
    return await db.select().from(coverageHistory).orderBy(desc(coverageHistory.createdAt));
  }

  async createCoverageHistory(history: InsertCoverageHistory): Promise<CoverageHistoryRecord> {
    const [newHistory] = await db
      .insert(coverageHistory)
      .values({
        ...history,
        assignmentId: history.assignmentId || `ASG${Date.now()}`,
      })
      .returning();
    return newHistory;
  }
}

export const storage = new DatabaseStorage();
