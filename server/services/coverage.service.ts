import { db } from '../db';
import { 
  employees, 
  coverageHistory, 
  coverageRequests,
  InsertCoverageRequest,
  InsertCoverageHistory
} from '@shared/schema';
import { and, eq } from 'drizzle-orm';

export class CoverageService {
  static async requestCoverage(employeeId: string, shift: string, reason: string) {
    const now = new Date();
    return db.insert(coverageRequests).values({
      employeeId,
      shift,
      reason,
      date: now,
      location: 'default',
      requestId: crypto.randomUUID() as string,
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 3600000).toISOString()
    } satisfies InsertCoverageRequest).returning();
  }

  static async getCoverageHistory(employeeId?: string) {
    return employeeId 
      ? db.select().from(coverageHistory).where(eq(coverageHistory.employeeId, employeeId))
      : db.select().from(coverageHistory);
  }

  static async approveCoverage(requestId: string, approvedById: string) {
    const request = await db.select().from(coverageRequests)
      .where(eq(coverageRequests.id, parseInt(requestId)))
      .then(res => res[0]);

    if (!request) throw new Error('Coverage request not found');

    const now = new Date();
    const responseTime = request.createdAt 
      ? Math.floor((now.getTime() - request.createdAt.getTime()) / 1000)
      : undefined;

    return db.transaction(async (tx) => {
      await tx.delete(coverageRequests).where(eq(coverageRequests.id, parseInt(requestId)));
      return tx.insert(coverageHistory).values({
        assignmentId: requestId,
        employeeId: request.employeeId,
        shift: request.shift,
        approvedById,
        date: now,
        location: request.location || 'default',
        outcome: 'approved',
        responseTime,
        startTime: request.startTime,
        endTime: request.endTime
      } satisfies InsertCoverageHistory).returning();
    });
  }
}
