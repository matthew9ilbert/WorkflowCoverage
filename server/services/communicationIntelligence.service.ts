
import { EventEmitter } from 'events';
import { storage } from '../storage';
import { AIAssistantService } from './aiAssistant.service';
import { MessageMonitorService } from './messageMonitor';

export interface CommunicationMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'user' | 'ai' | 'system' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'acted_upon';
  context?: any;
  suggestions?: string[];
  extractedTasks?: any[];
  workflowTriggers?: string[];
}

export interface PredictiveInsight {
  id: string;
  type: 'task_needed' | 'coverage_gap' | 'efficiency_opportunity' | 'issue_prevention';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  timeframe: string;
  basedOn: string[];
}

export interface SmartWorkflow {
  id: string;
  name: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  successRate: number;
  avgCompletionTime: number;
  active: boolean;
  executionHistory: any[];
}

export class CommunicationIntelligenceService extends EventEmitter {
  private static instance: CommunicationIntelligenceService;
  private messages: Map<string, CommunicationMessage> = new Map();
  private insights: PredictiveInsight[] = [];
  private workflows: Map<string, SmartWorkflow> = new Map();
  private aiService = AIAssistantService.getInstance();
  private messageMonitor = MessageMonitorService.getInstance();
  private contextMemory: Map<string, any> = new Map();
  private patternAnalyzer = new PatternAnalyzer();

  private constructor() {
    super();
    this.initializeDefaultWorkflows();
    this.startPredictiveAnalysis();
  }

  static getInstance(): CommunicationIntelligenceService {
    if (!CommunicationIntelligenceService.instance) {
      CommunicationIntelligenceService.instance = new CommunicationIntelligenceService();
    }
    return CommunicationIntelligenceService.instance;
  }

  private initializeDefaultWorkflows() {
    const defaultWorkflows: SmartWorkflow[] = [
      {
        id: 'urgent-task-auto-assign',
        name: 'Urgent Task Auto-Assignment',
        trigger: 'message contains urgency keywords',
        conditions: [
          { type: 'contains_keywords', keywords: ['urgent', 'emergency', 'asap', 'immediately'] },
          { type: 'priority', level: 'high' }
        ],
        actions: [
          { type: 'extract_task', priority: 'urgent' },
          { type: 'find_available_staff' },
          { type: 'auto_assign' },
          { type: 'send_notification' }
        ],
        successRate: 94,
        avgCompletionTime: 3.2,
        active: true,
        executionHistory: []
      },
      {
        id: 'coverage-gap-predictor',
        name: 'Coverage Gap Predictor',
        trigger: 'multiple requests in same area',
        conditions: [
          { type: 'location_clustering', threshold: 3 },
          { type: 'time_window', minutes: 30 }
        ],
        actions: [
          { type: 'predict_coverage_gap' },
          { type: 'suggest_staff_redistribution' },
          { type: 'create_coverage_request' }
        ],
        successRate: 87,
        avgCompletionTime: 5.1,
        active: true,
        executionHistory: []
      },
      {
        id: 'smart-escalation',
        name: 'Smart Escalation Handler',
        trigger: 'task not completed within SLA',
        conditions: [
          { type: 'task_overdue', threshold: '2h' },
          { type: 'no_response', minutes: 30 }
        ],
        actions: [
          { type: 'escalate_to_supervisor' },
          { type: 'suggest_alternatives' },
          { type: 'update_priority' }
        ],
        successRate: 91,
        avgCompletionTime: 2.8,
        active: true,
        executionHistory: []
      }
    ];

    defaultWorkflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });
  }

  private startPredictiveAnalysis() {
    setInterval(async () => {
      await this.generatePredictiveInsights();
    }, 30000); // Run every 30 seconds
  }

  async processMessage(messageData: any): Promise<CommunicationMessage> {
    const message: CommunicationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: messageData.content,
      sender: messageData.sender || 'user',
      timestamp: new Date(),
      type: messageData.type || 'user',
      priority: await this.determinePriority(messageData.content),
      status: 'sent',
      context: messageData.context
    };

    // Store message
    this.messages.set(message.id, message);

    // Process with AI for intelligent response
    const aiResponse = await this.generateIntelligentResponse(message);
    
    // Extract tasks if content suggests actionable items
    const extractedTasks = await this.extractTasks(message);
    if (extractedTasks.length > 0) {
      message.extractedTasks = extractedTasks;
    }

    // Generate suggestions
    message.suggestions = await this.generateSuggestions(message);

    // Check for workflow triggers
    const triggeredWorkflows = await this.checkWorkflowTriggers(message);
    message.workflowTriggers = triggeredWorkflows;

    // Execute triggered workflows
    for (const workflowId of triggeredWorkflows) {
      await this.executeWorkflow(workflowId, message);
    }

    // Store context for future reference
    this.updateContext(message);

    // Emit events for real-time updates
    this.emit('messageProcessed', message);
    this.emit('messageReceived', message);

    return message;
  }

  private async determinePriority(content: string): Promise<'low' | 'medium' | 'high' | 'urgent'> {
    const urgentKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'critical', 'broken', 'leak', 'overflow'];
    const highKeywords = ['important', 'priority', 'soon', 'today', 'deadline'];
    const mediumKeywords = ['please', 'when possible', 'schedule', 'plan'];

    const lowerContent = content.toLowerCase();

    if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) return 'urgent';
    if (highKeywords.some(keyword => lowerContent.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => lowerContent.includes(keyword))) return 'medium';
    
    return 'low';
  }

  private async generateIntelligentResponse(message: CommunicationMessage): Promise<CommunicationMessage> {
    const context = this.buildContextForMessage(message);
    
    const prompt = `
    As an expert EVS operations coordinator, provide an intelligent response to this message:
    
    Message: "${message.content}"
    Context: ${JSON.stringify(context)}
    Priority: ${message.priority}
    
    Provide:
    1. A helpful response
    2. Actionable next steps
    3. Any relevant warnings or considerations
    `;

    try {
      const aiResult = await this.aiService.handleRequest(prompt, context);
      
      const aiMessage: CommunicationMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: aiResult.response,
        sender: 'AI Assistant',
        timestamp: new Date(),
        type: 'ai',
        priority: message.priority,
        status: 'sent',
        context: { originalMessageId: message.id }
      };

      this.messages.set(aiMessage.id, aiMessage);
      this.emit('messageReceived', aiMessage);
      
      return aiMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return message;
    }
  }

  private async extractTasks(message: CommunicationMessage): Promise<any[]> {
    const taskKeywords = ['clean', 'sanitize', 'restock', 'repair', 'replace', 'check', 'inspect', 'maintain'];
    const locationKeywords = ['room', 'floor', 'bathroom', 'office', 'lobby', 'cafeteria', 'elevator'];
    
    const content = message.content.toLowerCase();
    const tasks: any[] = [];

    // Simple task extraction logic (would be enhanced with NLP)
    if (taskKeywords.some(keyword => content.includes(keyword))) {
      const task = {
        title: this.extractTaskTitle(message.content),
        description: message.content,
        priority: message.priority,
        location: this.extractLocation(message.content),
        deadline: this.extractDeadline(message.content),
        category: this.extractCategory(message.content),
        estimatedDuration: this.estimateDuration(message.content),
        autoCreated: true,
        sourceMessageId: message.id
      };

      tasks.push(task);
    }

    return tasks;
  }

  private extractTaskTitle(content: string): string {
    // Simple title extraction - would be enhanced with NLP
    const sentences = content.split('.')[0];
    return sentences.length > 50 ? sentences.substring(0, 47) + '...' : sentences;
  }

  private extractLocation(content: string): string {
    const locationPatterns = [
      /room\s+(\d+[a-zA-Z]?)/i,
      /floor\s+(\d+)/i,
      /(bathroom|restroom|office|lobby|cafeteria|elevator|hallway)/i
    ];

    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) return match[0];
    }

    return 'Not specified';
  }

  private extractDeadline(content: string): string | null {
    const timePatterns = [
      /by\s+(\d{1,2}:\d{2})/i,
      /(today|tomorrow|asap|immediately)/i,
      /in\s+(\d+)\s+(hours?|minutes?)/i
    ];

    for (const pattern of timePatterns) {
      const match = content.match(pattern);
      if (match) {
        // Convert to actual date/time
        return this.parseRelativeTime(match[0]);
      }
    }

    return null;
  }

  private extractCategory(content: string): string {
    const categories = {
      'cleaning': ['clean', 'sanitize', 'vacuum', 'mop', 'dust'],
      'maintenance': ['repair', 'fix', 'replace', 'maintain', 'check'],
      'restocking': ['restock', 'refill', 'supply', 'replenish'],
      'inspection': ['inspect', 'check', 'verify', 'monitor']
    };

    const lowerContent = content.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private estimateDuration(content: string): number {
    // Simple duration estimation based on task type
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('deep clean') || lowerContent.includes('thorough')) return 120;
    if (lowerContent.includes('quick') || lowerContent.includes('spot')) return 15;
    if (lowerContent.includes('repair') || lowerContent.includes('fix')) return 60;
    if (lowerContent.includes('restock') || lowerContent.includes('refill')) return 30;
    
    return 45; // Default 45 minutes
  }

  private parseRelativeTime(timeStr: string): string {
    const now = new Date();
    const lowerTimeStr = timeStr.toLowerCase();
    
    if (lowerTimeStr.includes('asap') || lowerTimeStr.includes('immediately')) {
      return now.toISOString();
    }
    
    if (lowerTimeStr.includes('today')) {
      const endOfDay = new Date(now);
      endOfDay.setHours(17, 0, 0, 0);
      return endOfDay.toISOString();
    }
    
    if (lowerTimeStr.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow.toISOString();
    }
    
    return timeStr;
  }

  private async generateSuggestions(message: CommunicationMessage): Promise<string[]> {
    const suggestions: string[] = [];
    const content = message.content.toLowerCase();

    // Context-aware suggestions
    if (content.includes('clean')) {
      suggestions.push('Schedule deep cleaning for this area');
      suggestions.push('Check supply levels for cleaning materials');
      suggestions.push('Assign additional staff if needed');
    }

    if (content.includes('urgent') || content.includes('emergency')) {
      suggestions.push('Escalate to supervisor immediately');
      suggestions.push('Dispatch nearest available staff');
      suggestions.push('Set up temporary coverage if needed');
    }

    if (content.includes('broken') || content.includes('repair')) {
      suggestions.push('Contact maintenance team');
      suggestions.push('Create work order');
      suggestions.push('Set up temporary alternative');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  private buildContextForMessage(message: CommunicationMessage): any {
    return {
      recentMessages: Array.from(this.messages.values()).slice(-5),
      currentTime: new Date().toISOString(),
      activeWorkflows: Array.from(this.workflows.values()).filter(w => w.active).length,
      systemLoad: this.calculateSystemLoad(),
      patterns: this.patternAnalyzer.getRecentPatterns()
    };
  }

  private calculateSystemLoad(): number {
    // Simple system load calculation
    return Math.min(this.messages.size / 100, 1.0);
  }

  private async checkWorkflowTriggers(message: CommunicationMessage): Promise<string[]> {
    const triggeredWorkflows: string[] = [];

    for (const [workflowId, workflow] of this.workflows.entries()) {
      if (!workflow.active) continue;

      let shouldTrigger = false;

      // Check each condition
      for (const condition of workflow.conditions) {
        switch (condition.type) {
          case 'contains_keywords':
            shouldTrigger = condition.keywords.some((keyword: string) => 
              message.content.toLowerCase().includes(keyword.toLowerCase())
            );
            break;
          case 'priority':
            shouldTrigger = message.priority === condition.level;
            break;
          case 'location_clustering':
            shouldTrigger = await this.checkLocationClustering(message, condition.threshold);
            break;
          case 'time_window':
            shouldTrigger = await this.checkTimeWindow(message, condition.minutes);
            break;
        }

        if (shouldTrigger) {
          triggeredWorkflows.push(workflowId);
          break;
        }
      }
    }

    return triggeredWorkflows;
  }

  private async checkLocationClustering(message: CommunicationMessage, threshold: number): Promise<boolean> {
    const location = this.extractLocation(message.content);
    if (location === 'Not specified') return false;

    const recentMessages = Array.from(this.messages.values())
      .filter(m => Date.now() - m.timestamp.getTime() < 30 * 60 * 1000) // Last 30 minutes
      .filter(m => this.extractLocation(m.content) === location);

    return recentMessages.length >= threshold;
  }

  private async checkTimeWindow(message: CommunicationMessage, minutes: number): Promise<boolean> {
    const windowStart = Date.now() - (minutes * 60 * 1000);
    const recentMessages = Array.from(this.messages.values())
      .filter(m => m.timestamp.getTime() >= windowStart);

    return recentMessages.length > 1;
  }

  async executeWorkflow(workflowId: string, triggerMessage: CommunicationMessage): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const executionStart = Date.now();

    try {
      for (const action of workflow.actions) {
        await this.executeWorkflowAction(action, triggerMessage, workflow);
      }

      // Update workflow metrics
      const executionTime = (Date.now() - executionStart) / 1000 / 60; // minutes
      workflow.executionHistory.push({
        timestamp: new Date(),
        success: true,
        executionTime,
        triggerMessageId: triggerMessage.id
      });

      // Update success rate
      const recentExecutions = workflow.executionHistory.slice(-10);
      const successCount = recentExecutions.filter(e => e.success).length;
      workflow.successRate = (successCount / recentExecutions.length) * 100;

      // Update average completion time
      const avgTime = recentExecutions.reduce((sum, e) => sum + e.executionTime, 0) / recentExecutions.length;
      workflow.avgCompletionTime = avgTime;

      this.emit('workflowExecuted', { workflowId, success: true, message: triggerMessage });

    } catch (error) {
      console.error(`Workflow ${workflowId} execution failed:`, error);
      
      workflow.executionHistory.push({
        timestamp: new Date(),
        success: false,
        executionTime: (Date.now() - executionStart) / 1000 / 60,
        triggerMessageId: triggerMessage.id,
        error: error.message
      });

      this.emit('workflowExecuted', { workflowId, success: false, error, message: triggerMessage });
    }
  }

  private async executeWorkflowAction(action: any, message: CommunicationMessage, workflow: SmartWorkflow): Promise<void> {
    switch (action.type) {
      case 'extract_task':
        const tasks = await this.extractTasks(message);
        for (const task of tasks) {
          if (action.priority) task.priority = action.priority;
          await storage.createTask(task);
        }
        break;

      case 'find_available_staff':
        // This would integrate with staff management system
        console.log('Finding available staff for workflow:', workflow.name);
        break;

      case 'auto_assign':
        // This would auto-assign tasks to available staff
        console.log('Auto-assigning tasks for workflow:', workflow.name);
        break;

      case 'send_notification':
        // This would send notifications to relevant parties
        console.log('Sending notifications for workflow:', workflow.name);
        break;

      case 'predict_coverage_gap':
        await this.generateCoverageGapPrediction(message);
        break;

      case 'suggest_staff_redistribution':
        await this.generateStaffRedistributionSuggestion(message);
        break;

      case 'create_coverage_request':
        await this.createAutoCoverageRequest(message);
        break;

      case 'escalate_to_supervisor':
        await this.escalateToSupervisor(message);
        break;

      case 'suggest_alternatives':
        await this.generateAlternativeSuggestions(message);
        break;

      case 'update_priority':
        await this.updateTaskPriority(message);
        break;
    }
  }

  private async generateCoverageGapPrediction(message: CommunicationMessage): Promise<void> {
    const insight: PredictiveInsight = {
      id: `insight_${Date.now()}`,
      type: 'coverage_gap',
      title: 'Potential Coverage Gap Detected',
      description: `Based on recent message patterns, a coverage gap may occur in ${this.extractLocation(message.content)}`,
      confidence: 0.85,
      impact: 'high',
      suggestedActions: [
        'Reassign staff from less busy areas',
        'Schedule additional coverage',
        'Monitor situation closely'
      ],
      timeframe: 'Next 2 hours',
      basedOn: ['Message clustering', 'Historical patterns', 'Current staff allocation']
    };

    this.insights.push(insight);
    this.emit('insightGenerated', insight);
  }

  private async generateStaffRedistributionSuggestion(message: CommunicationMessage): Promise<void> {
    // Implementation for staff redistribution suggestions
    console.log('Generating staff redistribution suggestion based on:', message.content);
  }

  private async createAutoCoverageRequest(message: CommunicationMessage): Promise<void> {
    // Implementation for auto coverage request creation
    console.log('Creating auto coverage request for:', message.content);
  }

  private async escalateToSupervisor(message: CommunicationMessage): Promise<void> {
    // Implementation for supervisor escalation
    console.log('Escalating to supervisor:', message.content);
  }

  private async generateAlternativeSuggestions(message: CommunicationMessage): Promise<void> {
    // Implementation for alternative suggestions
    console.log('Generating alternative suggestions for:', message.content);
  }

  private async updateTaskPriority(message: CommunicationMessage): Promise<void> {
    // Implementation for updating task priority
    console.log('Updating task priority based on:', message.content);
  }

  private updateContext(message: CommunicationMessage): void {
    const contextKey = `${message.sender}_${new Date().toDateString()}`;
    const existingContext = this.contextMemory.get(contextKey) || { messages: [], patterns: [] };
    
    existingContext.messages.push({
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      priority: message.priority
    });

    // Keep only last 10 messages per context
    if (existingContext.messages.length > 10) {
      existingContext.messages = existingContext.messages.slice(-10);
    }

    this.contextMemory.set(contextKey, existingContext);
  }

  private async generatePredictiveInsights(): Promise<void> {
    // Analyze patterns and generate insights
    const patterns = this.patternAnalyzer.analyzeRecentActivity(Array.from(this.messages.values()));
    
    for (const pattern of patterns) {
      if (pattern.confidence > 0.7) {
        const insight = this.createInsightFromPattern(pattern);
        if (insight) {
          this.insights.push(insight);
          this.emit('insightGenerated', insight);
        }
      }
    }

    // Clean up old insights (keep only last 20)
    if (this.insights.length > 20) {
      this.insights = this.insights.slice(-20);
    }
  }

  private createInsightFromPattern(pattern: any): PredictiveInsight | null {
    // Convert patterns to actionable insights
    switch (pattern.type) {
      case 'recurring_issue':
        return {
          id: `insight_${Date.now()}`,
          type: 'issue_prevention',
          title: `Recurring Issue Pattern Detected`,
          description: `Pattern shows recurring issues with ${pattern.subject}. Consider preventive measures.`,
          confidence: pattern.confidence,
          impact: pattern.impact,
          suggestedActions: [
            'Schedule preventive maintenance',
            'Increase monitoring frequency',
            'Train staff on early detection'
          ],
          timeframe: pattern.timeframe,
          basedOn: ['Historical data', 'Pattern analysis', 'Frequency tracking']
        };

      case 'efficiency_opportunity':
        return {
          id: `insight_${Date.now()}`,
          type: 'efficiency_opportunity',
          title: `Efficiency Improvement Opportunity`,
          description: pattern.description,
          confidence: pattern.confidence,
          impact: 'medium',
          suggestedActions: pattern.suggestions,
          timeframe: 'Next week',
          basedOn: ['Performance metrics', 'Time analysis', 'Resource utilization']
        };

      default:
        return null;
    }
  }

  // Public API methods
  async getMessages(limit: number = 50): Promise<CommunicationMessage[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getInsights(): Promise<PredictiveInsight[]> {
    return this.insights.slice(-10); // Return last 10 insights
  }

  async getWorkflows(): Promise<SmartWorkflow[]> {
    return Array.from(this.workflows.values());
  }

  async toggleWorkflow(workflowId: string, active: boolean): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.active = active;
      this.emit('workflowToggled', { workflowId, active });
    }
  }
}

class PatternAnalyzer {
  analyzeRecentActivity(messages: CommunicationMessage[]): any[] {
    const patterns: any[] = [];
    
    // Analyze message frequency patterns
    const hourlyDistribution = this.analyzeHourlyDistribution(messages);
    const locationPatterns = this.analyzeLocationPatterns(messages);
    const priorityTrends = this.analyzePriorityTrends(messages);
    
    patterns.push(...hourlyDistribution);
    patterns.push(...locationPatterns);
    patterns.push(...priorityTrends);
    
    return patterns;
  }

  private analyzeHourlyDistribution(messages: CommunicationMessage[]): any[] {
    // Analyze when messages typically occur
    const hourCounts: { [key: number]: number } = {};
    
    messages.forEach(message => {
      const hour = message.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const patterns: any[] = [];
    
    // Find peak hours
    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[Number(a)] > hourCounts[Number(b)] ? a : b
    );

    if (hourCounts[Number(peakHour)] > 5) {
      patterns.push({
        type: 'peak_activity',
        subject: `${peakHour}:00 hour`,
        confidence: 0.8,
        impact: 'medium',
        description: `Peak activity occurs around ${peakHour}:00`,
        timeframe: 'Daily',
        suggestions: ['Ensure adequate staffing during peak hours', 'Pre-position resources']
      });
    }

    return patterns;
  }

  private analyzeLocationPatterns(messages: CommunicationMessage[]): any[] {
    const locationCounts: { [key: string]: number } = {};
    
    messages.forEach(message => {
      const location = this.extractLocationFromContent(message.content);
      if (location !== 'Not specified') {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    const patterns: any[] = [];
    
    // Find frequently mentioned locations
    Object.entries(locationCounts).forEach(([location, count]) => {
      if (count > 3) {
        patterns.push({
          type: 'location_hotspot',
          subject: location,
          confidence: Math.min(count / 10, 0.95),
          impact: count > 5 ? 'high' : 'medium',
          description: `${location} requires frequent attention`,
          timeframe: 'Ongoing',
          suggestions: [`Schedule regular maintenance for ${location}`, 'Consider permanent staff assignment']
        });
      }
    });

    return patterns;
  }

  private analyzePriorityTrends(messages: CommunicationMessage[]): any[] {
    const recentMessages = messages.filter(m => 
      Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const priorityCounts = {
      urgent: recentMessages.filter(m => m.priority === 'urgent').length,
      high: recentMessages.filter(m => m.priority === 'high').length,
      medium: recentMessages.filter(m => m.priority === 'medium').length,
      low: recentMessages.filter(m => m.priority === 'low').length
    };

    const patterns: any[] = [];

    if (priorityCounts.urgent > 2) {
      patterns.push({
        type: 'priority_spike',
        subject: 'urgent tasks',
        confidence: 0.9,
        impact: 'high',
        description: 'Unusual spike in urgent tasks detected',
        timeframe: 'Last 24 hours',
        suggestions: ['Review operational procedures', 'Increase supervisor oversight', 'Analyze root causes']
      });
    }

    return patterns;
  }

  private extractLocationFromContent(content: string): string {
    const locationPatterns = [
      /room\s+(\d+[a-zA-Z]?)/i,
      /floor\s+(\d+)/i,
      /(bathroom|restroom|office|lobby|cafeteria|elevator|hallway)/i
    ];

    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) return match[0];
    }

    return 'Not specified';
  }

  getRecentPatterns(): any[] {
    // Return cached recent patterns
    return [];
  }
}
