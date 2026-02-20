import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetJiraTicketHandler } from './get-jira-ticket-handler.js';
import type { IJiraClient, ToolResult } from '../types/index.js';

describe('GetJiraTicketHandler', () => {
  let mockJiraClient: IJiraClient;
  let handler: GetJiraTicketHandler;

  beforeEach(() => {
    mockJiraClient = {
      getTicket: vi.fn(),
    };
    handler = new GetJiraTicketHandler(mockJiraClient);
  });

  it('should validate valid arguments', () => {
    const validArgs = {
      ticket_id: 'PROJ-123',
      expand: ['names'],
      fields: ['summary'],
    };
    expect(handler.validate(validArgs)).toBe(true);
  });

  it('should invalidate arguments missing ticket_id', () => {
    const invalidArgs = {
      expand: ['names'],
    };
    expect(handler.validate(invalidArgs)).toBe(false);
  });

  it('should invalidate arguments with invalid ticket_id type', () => {
    const invalidArgs = {
      ticket_id: 123,
    };
    expect(handler.validate(invalidArgs)).toBe(false);
  });

  it('should invalidate arguments with invalid ticket_id format', () => {
      const invalidFormats = [
          '123',
          'PROJECT-',
          '-123',
          'PROJECT-123-ABC',
          '../../etc/passwd',
          'PROJECT_123'
      ];

      invalidFormats.forEach(ticket_id => {
          const invalidArgs = { ticket_id };
          expect(handler.validate(invalidArgs)).toBe(false);
      });
  });

  it('should invalidate arguments with invalid expand type', () => {
      const invalidArgs = {
        ticket_id: 'PROJ-123',
        expand: 'names', // Should be array
      };
      expect(handler.validate(invalidArgs)).toBe(false);
    });

  it('should invalidate arguments with invalid expand array contents', () => {
      const invalidArgs = {
        ticket_id: 'PROJ-123',
        expand: [123],
      };
      expect(handler.validate(invalidArgs)).toBe(false);
  });

  it('should invalidate arguments with invalid fields type', () => {
      const invalidArgs = {
        ticket_id: 'PROJ-123',
        fields: 'summary', // Should be array
      };
      expect(handler.validate(invalidArgs)).toBe(false);
  });

  it('should execute successfully with valid arguments', async () => {
    const args = {
      ticket_id: 'PROJ-123',
      expand: ['names'],
      fields: ['summary'],
    };
    const mockTicket = { key: 'PROJ-123', fields: { summary: 'Test' } };
    (mockJiraClient.getTicket as any).mockResolvedValue(mockTicket);

    const result = await handler.execute(args);

    expect(mockJiraClient.getTicket).toHaveBeenCalledWith(
      args.ticket_id,
      args.expand,
      args.fields
    );
    expect(result).toEqual({
      content: [{
        type: 'text',
        text: JSON.stringify(mockTicket),
      }],
    });
  });

  it('should return error result when validation fails', async () => {
    const invalidArgs = {};

    const result = await handler.execute(invalidArgs);

    expect(result).toEqual({
      content: [{ type: 'text', text: 'Invalid arguments for get_jira_ticket' }],
      isError: true,
    });
    expect(mockJiraClient.getTicket).not.toHaveBeenCalled();
  });

  it('should handle non-object args in isValidArgs via validate', () => {
      expect(handler.validate(null)).toBe(false);
      expect(handler.validate("string")).toBe(false);
  });
});
