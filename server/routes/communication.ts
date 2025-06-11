
import { Router } from 'express';
import { CommunicationIntelligenceService } from '../services/communicationIntelligence.service';

const router = Router();
const commService = CommunicationIntelligenceService.getInstance();

// Get recent messages
router.get('/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await commService.getMessages(limit);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send new message
router.post('/send', async (req, res) => {
  try {
    const messageData = req.body;
    messageData.sender = req.user?.name || 'Unknown User';
    
    const processedMessage = await commService.processMessage(messageData);
    res.json(processedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get predictive insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await commService.getInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Get smart workflows
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await commService.getWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Toggle workflow
router.post('/workflows/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    await commService.toggleWorkflow(id, active);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle workflow' });
  }
});

// Execute workflow manually
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Create a mock message to trigger the workflow
    const mockMessage = {
      content: 'Manual workflow execution',
      sender: req.user?.name || 'System',
      type: 'system',
      context: { manualExecution: true }
    };

    const processedMessage = await commService.processMessage(mockMessage);
    await commService.executeWorkflow(id, processedMessage);
    
    res.json({ success: true, message: 'Workflow executed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

export default router;
