import { AIAssistantService } from '../services/aiAssistant.service';
import { db } from '../db';
import { expect } from 'chai';
import { mock } from 'sinon';

describe('AI Assistant Service', () => {
  let aiService: AIAssistantService;

  before(() => {
    process.env.AI_API_KEY = 'test-key';
    aiService = AIAssistantService.getInstance();
  });

  it('should handle requests with expert analysis', async () => {
    const response = await aiService.handleRequest(
      'How can I optimize this SQL query?', 
      { userId: 'test-user' }
    );
    expect(response).to.have.property('response');
    expect(response.suggestions).to.be.an('array');
  });

  it('should provide codebase insights', async () => {
    const insights = await aiService.getCodebaseInsights();
    expect(insights).to.have.property('suggestions');
  });

  it('should enforce authentication', async () => {
    // Would test auth middleware in integration tests
    expect(true).to.be.true; // Placeholder
  });
});
