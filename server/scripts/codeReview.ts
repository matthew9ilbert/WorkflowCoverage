import { AIAssistantService } from '../services/aiAssistant.service';
import { db } from '../db';
import { logger } from '../middleware/logger';
import { schema } from '@shared/schema';
import { generateId } from '@server/utils/idGenerator';

export async function runAutomatedReview() {
  try {
    const aiService = AIAssistantService.getInstance();
    const insights = await aiService.getCodebaseInsights();
    
    // Save results to database
    await db.insert(schema.codeReviews).values({
      id: generateId(),
      date: new Date(),
      findings: JSON.stringify(insights),
      reviewedBy: 'AI-Assistant'
    });
    
    logger.info('Automated code review completed', { insights });
    return insights;
  } catch (err) {
    logger.error('Automated review failed', { error: err });
    throw err;
  }
}

// Run on schedule (would be set up in package.json)
// "scripts": {
//   "review": "tsx server/scripts/codeReview.ts"
// }
