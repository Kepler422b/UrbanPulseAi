import { describe, it, expect } from 'vitest';
import {
  getCategoryLabel,
  getStatusBadgeConfig,
  getPriorityBadgeConfig,
} from '../utils/formatters';

describe('UI Formatters', () => {
  it('correctly maps issue category identifiers to readable titles', () => {
    expect(getCategoryLabel('potholes_damaged_roads')).toBe('Potholes & Damaged Roads');
    expect(getCategoryLabel('garbage_overflow')).toBe('Garbage Overflow & Waste');
    expect(getCategoryLabel('broken_streetlights')).toBe('Broken Streetlights');
  });

  it('provides appropriate color schemes for issue statuses', () => {
    const reported = getStatusBadgeConfig('reported');
    expect(reported.label).toBe('Reported');

    const inProgress = getStatusBadgeConfig('in_progress');
    expect(inProgress.label).toBe('In Progress');

    const resolved = getStatusBadgeConfig('resolved');
    expect(resolved.label).toBe('Resolved');
  });

  it('provides appropriate color schemes for priority tiers', () => {
    const critical = getPriorityBadgeConfig('critical');
    expect(critical.label).toBe('Critical');

    const high = getPriorityBadgeConfig('high');
    expect(high.label).toBe('High');

    const low = getPriorityBadgeConfig('low');
    expect(low.label).toBe('Low');
  });
});
