import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertEmployeeSchema, 
  insertTaskSchema, 
  insertCoverageRequestSchema,
  insertAnnouncementSchema 
} from "@shared/schema";
import { z } from "zod";
import { CoverageService } from './services/coverage.service';
import { AIAssistantService } from './services/aiAssistant.service';
import { verifyAIAccess } from './middleware/aiAuth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating employee:", error);
        res.status(500).json({ message: "Failed to create employee" });
      }
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: "Failed to update employee" });
      }
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  // Coverage request routes
  app.get('/api/coverage-requests', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getCoverageRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching coverage requests:", error);
      res.status(500).json({ message: "Failed to fetch coverage requests" });
    }
  });

  app.post('/api/coverage-requests', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCoverageRequestSchema.parse(req.body);
      const request = await storage.createCoverageRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating coverage request:", error);
        res.status(500).json({ message: "Failed to create coverage request" });
      }
    }
  });

  app.put('/api/coverage-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCoverageRequestSchema.partial().parse(req.body);
      const request = await storage.updateCoverageRequest(id, validatedData);
      if (!request) {
        return res.status(404).json({ message: "Coverage request not found" });
      }
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating coverage request:", error);
        res.status(500).json({ message: "Failed to update coverage request" });
      }
    }
  });

  // Coverage routes
  app.post('/api/coverage/request', isAuthenticated, async (req: any, res) => {
    try {
      const { shift, reason } = insertCoverageRequestSchema.parse(req.body);
      const result = await CoverageService.requestCoverage(
        req.user.claims.sub,
        shift as string,
        reason as string
      );
      res.json(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Request failed';
      res.status(400).json({ error });
    }
  });

  app.get('/api/coverage/history', isAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.query.employeeId;
      const history = await CoverageService.getCoverageHistory(employeeId);
      res.json(history);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to get history';
      res.status(400).json({ error });
    }
  });

  app.post('/api/coverage/approve/:id', isAuthenticated, async (req: any, res) => {
    try {
      const result = await CoverageService.approveCoverage(req.params.id, req.user.claims.sub);
      res.json(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to approve coverage';
      res.status(400).json({ error });
    }
  });

  // Announcement routes
  app.get('/api/announcements', isAuthenticated, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAnnouncementSchema.parse({
        ...req.body,
        author: userId
      });
      const announcement = await storage.createAnnouncement(validatedData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Failed to create announcement" });
      }
    }
  });

  // Analytics routes
  app.get('/api/analytics/dashboard', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get('/api/analytics/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getAnalyticsMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      res.status(500).json({ message: "Failed to fetch analytics metrics" });
    }
  });

  // Text scanning route
  app.post('/api/text-scan', isAuthenticated, async (req, res) => {
    try {
      const { content, source } = req.body;
      if (!content || !source) {
        return res.status(400).json({ message: "Content and source are required" });
      }
      
      const result = await storage.processTextInput(content, source);
      res.json(result);
    } catch (error) {
      console.error("Error processing text input:", error);
      res.status(500).json({ message: "Failed to process text input" });
    }
  });

  // AI Assistant endpoints
  app.post('/api/ai/assist', isAuthenticated, verifyAIAccess, async (req: any, res) => {
    try {
      const response = await AIAssistantService.getInstance().handleRequest(
        req.body.message,
        req.context
      );
      res.json(response);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'AI assistance unavailable';
      res.status(500).json({ error });
    }
  });

  app.get('/api/ai/insights', isAuthenticated, verifyAIAccess, async (req, res) => {
    try {
      const insights = await AIAssistantService.getInstance().getCodebaseInsights();
      res.json(insights);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to get insights';
      res.status(500).json({ error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
