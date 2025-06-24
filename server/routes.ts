import type { Express, Request, Response, NextFunction } from "express";
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
import path from 'path';
import type { ParsedQs } from 'qs';
import { verifyAuthToken, createSession } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      claims: {
        sub: string;
        email?: string;
        name?: string;
      };
    };
    context?: Record<string, any>;
  }
}

// Helper function for error handling
function handleError(error: unknown, res: Response) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: "Validation error", errors: error.errors });
  }
  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(500).json({ message: "Unknown error occurred" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Valid authentication token required" });
      }
      
      const user = await verifyAuthToken(token);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired credentials" });
      }
      
      const sessionToken = await createSession(user.id);
      
      res.json({
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (err: unknown) {
      handleError(err, res);
    }
  });

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post('/api/employees', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Coverage request routes
  app.get('/api/coverage-requests', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const requests = await storage.getCoverageRequests();
      res.json(requests);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post('/api/coverage-requests', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const validatedData = insertCoverageRequestSchema.parse(req.body);
      const request = await storage.createCoverageRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.put('/api/coverage-requests/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCoverageRequestSchema.partial().parse(req.body);
      const request = await storage.updateCoverageRequest(id, validatedData);
      if (!request) {
        return res.status(404).json({ message: "Coverage request not found" });
      }
      res.json(request);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Coverage routes
  app.post('/api/coverage/request', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { shift, reason } = insertCoverageRequestSchema.parse(req.body);
      const result = await CoverageService.requestCoverage(
        req.user.claims.sub,
        shift as string,
        reason as string
      );
      res.json(result);
    } catch (err: unknown) {
      handleError(err, res);
    }
  });

  app.get('/api/coverage/history', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const employeeId = typeof req.query.employeeId === 'string' ? req.query.employeeId : undefined;
      const history = await CoverageService.getCoverageHistory(employeeId);
      res.json(history);
    } catch (err: unknown) {
      handleError(err, res);
    }
  });

  app.post('/api/coverage/approve/:id', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const result = await CoverageService.approveCoverage(req.params.id, req.user.claims.sub);
      res.json(result);
    } catch (err: unknown) {
      handleError(err, res);
    }
  });

  // Announcement routes
  app.get('/api/announcements', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAnnouncementSchema.parse({
        ...req.body,
        author: userId
      });
      const announcement = await storage.createAnnouncement(validatedData);
      res.status(201).json(announcement);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Analytics routes
  app.get('/api/analytics/dashboard', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      handleError(error, res);
    }
  });

  app.get('/api/analytics/metrics', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const metrics = await storage.getAnalyticsMetrics();
      res.json(metrics);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Text scanning route
  app.post('/api/text-scan', isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { content, source } = req.body;
      if (!content || !source) {
        return res.status(400).json({ message: "Content and source are required" });
      }

      const result = await storage.processTextInput(content, source);
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  });

  // AI Assistant endpoints
  app.post('/api/ai/assist', isAuthenticated, verifyAIAccess, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const response = await AIAssistantService.getInstance().handleRequest(
        req.body.message,
        req.context || {}
      );
      res.json(response);
    } catch (err: unknown) {
      handleError(err, res);
    }
  });

  app.get('/api/ai/insights', isAuthenticated, verifyAIAccess, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const insights = await AIAssistantService.getInstance().getCodebaseInsights();
      res.json(insights);
    } catch (err: unknown) {
      handleError(err, res);
    }
  });

  // Apple Shortcuts API routes (public access for automation)
  app.use('/api/shortcuts', (await import('./shortcuts')).default);
  // Communication routes
  app.use('/api/communication', (await import('./routes/communication')).default);

  // Client-side routing fallback
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/dist/client/index.html'));
  });

  const httpServer = createServer(app);
  return httpServer;
}