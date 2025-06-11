import { Router } from 'express';
import { storage } from './storage';
import { insertTaskSchema, insertTextInputSchema } from '../shared/schema';
import { z } from 'zod';

const router = Router();

// Apple Shortcuts webhook endpoint for text processing
router.post('/process-text', async (req, res) => {
  try {
    const { content, source, sender, messageId } = req.body;
    
    if (!content || !source) {
      return res.status(400).json({ error: 'Content and source are required' });
    }

    // Process the text input through our AI assistant
    const result = await storage.processTextInput(content, source);
    
    // Create text input record
    const textInput = await storage.createTextInput({
      textId: messageId || `${source}-${Date.now()}`,
      source,
      content,
      sender,
      extractedTasks: result.extractedTasks || [],
      processed: true
    });

    res.json({
      success: true,
      textInputId: textInput.id,
      extractedTasks: result.extractedTasks,
      summary: `Processed ${source} message${result.extractedTasks?.length ? ` and extracted ${result.extractedTasks.length} tasks` : ''}`
    });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: 'Failed to process text' });
  }
});

// Create task from Apple Shortcuts
router.post('/create-task', async (req, res) => {
  try {
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(taskData);
    
    res.json({
      success: true,
      task,
      message: `Task "${task.title}" created successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid task data', details: error.errors });
    }
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get tasks for Apple Shortcuts
router.get('/tasks', async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.query;
    let tasks = await storage.getTasks();
    
    // Filter tasks based on query parameters
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    if (assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === assignedTo);
    }
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }
    
    res.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update task status from Apple Shortcuts
router.patch('/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const task = await storage.updateTask(parseInt(id), { status });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      success: true,
      task,
      message: `Task status updated to "${status}"`
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Get dashboard summary for Apple Shortcuts
router.get('/dashboard-summary', async (req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    
    res.json({
      success: true,
      summary: {
        totalEmployees: stats.totalEmployees,
        activeTasks: stats.activeTasks,
        completionRate: stats.completionRate,
        coverageRequests: stats.coverageRequests
      },
      textSummary: `${stats.activeTasks} active tasks, ${stats.completionRate}% completion rate, ${stats.coverageRequests} open coverage requests`
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Health check endpoint for Apple Shortcuts
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Workplace Management System'
  });
});

export default router;