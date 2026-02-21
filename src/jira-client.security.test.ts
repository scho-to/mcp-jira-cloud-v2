import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraClient } from './jira-client.js';
import type { JiraConfig } from './types/index.js';
import { Version2Client } from 'jira.js/version2';

// Mock jira.js/version2
vi.mock('jira.js/version2', () => {
  return {
    Version2Client: vi.fn(),
  };
});

describe('JiraClient Security', () => {
  const mockConfig: JiraConfig = {
    host: 'https://test.jira.com',
    email: 'test@example.com',
    apiToken: 'test-token',
  };

  let client: JiraClient;
  let mockGetIssue: any;

  beforeEach(() => {
    mockGetIssue = vi.fn();

    // Setup the mock implementation for Version2Client
    (Version2Client as any).mockImplementation(function() {
      return {
        issues: {
          getIssue: mockGetIssue,
        },
      };
    });

    client = new JiraClient(mockConfig);
  });

  it('should throw an error for invalid ticket ID format', async () => {
    const invalidTicketId = 'INVALID_FORMAT';

    await expect(client.getTicket(invalidTicketId)).rejects.toThrow(
      `Invalid ticket ID format: ${invalidTicketId}`
    );
  });

  it('should throw an error for malicious ticket ID format', async () => {
    const maliciousTicketId = '../etc/passwd';

    await expect(client.getTicket(maliciousTicketId)).rejects.toThrow(
      `Invalid ticket ID format: ${maliciousTicketId}`
    );
  });
});
