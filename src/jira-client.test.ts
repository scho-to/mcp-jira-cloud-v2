import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JiraClient } from './jira-client.js';
import type { JiraConfig } from './types/index.js';
import { Version2Client } from 'jira.js/version2';

// Mock jira.js/version2
vi.mock('jira.js/version2', () => {
  return {
    Version2Client: vi.fn(),
  };
});

describe('JiraClient', () => {
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct config', () => {
    expect(Version2Client).toHaveBeenCalledWith({
      host: mockConfig.host,
      authentication: {
        basic: {
          email: mockConfig.email,
          apiToken: mockConfig.apiToken,
        },
      },
    });
  });

  it('should get a ticket with default fields', async () => {
    const ticketId = 'PROJ-123';
    const mockResponse = { key: ticketId, fields: { summary: 'Test' } };
    mockGetIssue.mockResolvedValue(mockResponse);

    const result = await client.getTicket(ticketId);

    expect(mockGetIssue).toHaveBeenCalledWith({
      issueIdOrKey: ticketId,
      expand: undefined,
      fields: ['summary', 'description', 'comment'],
    });
    expect(result).toBe(mockResponse);
  });

  it('should get a ticket with specified fields and expand', async () => {
    const ticketId = 'PROJ-123';
    const expand = ['names'];
    const fields = ['summary'];
    const mockResponse = { key: ticketId, fields: { summary: 'Test' } };
    mockGetIssue.mockResolvedValue(mockResponse);

    const result = await client.getTicket(ticketId, expand, fields);

    expect(mockGetIssue).toHaveBeenCalledWith({
      issueIdOrKey: ticketId,
      expand: 'names',
      fields: ['summary'],
    });
    expect(result).toBe(mockResponse);
  });

  it('should throw error when api fails', async () => {
    const ticketId = 'PROJ-123';
    const errorMessage = 'API Error';
    mockGetIssue.mockRejectedValue(new Error(errorMessage));

    await expect(client.getTicket(ticketId)).rejects.toThrow(
      `Failed to fetch Jira ticket ${ticketId}: ${errorMessage}`
    );
  });

  it('should throw unknown error when api fails with non-error object', async () => {
    const ticketId = 'PROJ-123';
    mockGetIssue.mockRejectedValue('Something went wrong');

    await expect(client.getTicket(ticketId)).rejects.toThrow(
      `Failed to fetch Jira ticket ${ticketId}: Unknown error`
    );
  });
});
