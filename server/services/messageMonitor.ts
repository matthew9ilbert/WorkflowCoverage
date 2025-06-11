import { EventEmitter } from 'events';
import { storage } from '../storage';
import { AIAssistantService } from './aiAssistant.service';

export interface MessageSource {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'teams' | 'outlook' | 'voicemail' | 'calendar' | 'notes' | 'reminders';
  enabled: boolean;
  pollInterval?: number;
  webhookUrl?: string;
  apiConfig?: any;
}

export interface IncomingMessage {
  id: string;
  source: string;
  content: string;
  sender: string;
  timestamp: Date;
  metadata?: any;
}

export class MessageMonitorService extends EventEmitter {
  private static instance: MessageMonitorService;
  private sources: Map<string, MessageSource> = new Map();
  private activePollers: Map<string, NodeJS.Timeout> = new Map();
  private aiService = AIAssistantService.getInstance();

  private constructor() {
    super();
    this.setupDefaultSources();
  }

  static getInstance(): MessageMonitorService {
    if (!MessageMonitorService.instance) {
      MessageMonitorService.instance = new MessageMonitorService();
    }
    return MessageMonitorService.instance;
  }

  private setupDefaultSources() {
    const defaultSources: MessageSource[] = [
      { id: 'sms', name: 'Text Messages', type: 'sms', enabled: false, pollInterval: 30000 },
      { id: 'gmail', name: 'Gmail', type: 'email', enabled: false, pollInterval: 60000 },
      { id: 'outlook', name: 'Outlook Email', type: 'outlook', enabled: false, pollInterval: 60000 },
      { id: 'teams', name: 'Microsoft Teams', type: 'teams', enabled: false, pollInterval: 30000 },
      { id: 'voicemail', name: 'Voicemail Transcripts', type: 'voicemail', enabled: false, pollInterval: 120000 },
      { id: 'calendar', name: 'Calendar Events', type: 'calendar', enabled: false, pollInterval: 300000 },
      { id: 'notes', name: 'Notes App', type: 'notes', enabled: false, pollInterval: 60000 },
      { id: 'reminders', name: 'Reminders App', type: 'reminders', enabled: false, pollInterval: 60000 }
    ];

    defaultSources.forEach(source => {
      this.sources.set(source.id, source);
    });
  }

  async enableSource(sourceId: string, config?: any): Promise<void> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    source.enabled = true;
    if (config) {
      source.apiConfig = config;
    }

    // Start polling for this source
    this.startPolling(source);
    
    console.log(`Enabled monitoring for ${source.name}`);
  }

  async disableSource(sourceId: string): Promise<void> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    source.enabled = false;
    this.stopPolling(sourceId);
    
    console.log(`Disabled monitoring for ${source.name}`);
  }

  private startPolling(source: MessageSource) {
    if (this.activePollers.has(source.id)) {
      this.stopPolling(source.id);
    }

    if (!source.pollInterval) return;

    const poller = setInterval(async () => {
      try {
        await this.pollSource(source);
      } catch (error) {
        console.error(`Error polling ${source.name}:`, error);
        this.emit('error', { source: source.id, error });
      }
    }, source.pollInterval);

    this.activePollers.set(source.id, poller);
  }

  private stopPolling(sourceId: string) {
    const poller = this.activePollers.get(sourceId);
    if (poller) {
      clearInterval(poller);
      this.activePollers.delete(sourceId);
    }
  }

  private async pollSource(source: MessageSource): Promise<void> {
    // This would integrate with actual APIs in production
    // For now, we'll emit sample events for testing
    console.log(`Polling ${source.name} for new messages...`);
    
    // In production, this would call the appropriate API
    // and process any new messages found
  }

  async processIncomingMessage(message: IncomingMessage): Promise<void> {
    try {
      console.log(`Processing message from ${message.source}: ${message.content.substring(0, 100)}...`);

      // Store the message
      const textInput = await storage.createTextInput({
        textId: message.id,
        source: message.source,
        content: message.content,
        sender: message.sender,
        processed: false
      });

      // Process with AI to extract tasks and insights
      const result = await storage.processTextInput(message.content, message.source);

      // Update the text input with processing results
      if (result.extractedTasks && result.extractedTasks.length > 0) {
        console.log(`Extracted ${result.extractedTasks.length} tasks from ${message.source} message`);
        
        // Create tasks automatically if they meet certain criteria
        for (const taskData of result.extractedTasks) {
          if (taskData.priority === 'high' || taskData.dueDate) {
            await storage.createTask(taskData);
            console.log(`Auto-created high priority task: ${taskData.title}`);
          }
        }
      }

      // Emit events for real-time updates
      this.emit('messageProcessed', {
        message,
        extractedTasks: result.extractedTasks,
        textInputId: textInput.id
      });

      // Send notifications if configured
      await this.sendNotifications(message, result);

    } catch (error) {
      console.error('Error processing incoming message:', error);
      this.emit('error', { message, error });
    }
  }

  private async sendNotifications(message: IncomingMessage, result: any): Promise<void> {
    // This would integrate with notification services
    // For Apple Shortcuts integration, we can trigger webhooks
    if (result.extractedTasks && result.extractedTasks.length > 0) {
      console.log(`Would send notification: ${result.extractedTasks.length} tasks extracted from ${message.source}`);
    }
  }

  async getSourceStatus(): Promise<MessageSource[]> {
    return Array.from(this.sources.values());
  }

  async processWebhookMessage(sourceId: string, payload: any): Promise<any> {
    const source = this.sources.get(sourceId);
    if (!source || !source.enabled) {
      throw new Error(`Source ${sourceId} not found or disabled`);
    }

    // Convert webhook payload to our standard message format
    const message: IncomingMessage = {
      id: payload.id || `${sourceId}-${Date.now()}`,
      source: sourceId,
      content: payload.content || payload.text || payload.body,
      sender: payload.sender || payload.from || 'unknown',
      timestamp: new Date(payload.timestamp || Date.now()),
      metadata: payload.metadata || {}
    };

    await this.processIncomingMessage(message);

    return {
      success: true,
      messageId: message.id,
      processed: true
    };
  }

  // Apple Shortcuts specific methods
  async createShortcutTrigger(sourceId: string): Promise<string> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    // Generate a webhook URL for this source
    const webhookUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/shortcuts/webhook/${sourceId}`;
    source.webhookUrl = webhookUrl;

    return webhookUrl;
  }

  stop(): void {
    // Stop all active pollers
    Array.from(this.activePollers.keys()).forEach(sourceId => {
      this.stopPolling(sourceId);
    });
    this.removeAllListeners();
  }
}