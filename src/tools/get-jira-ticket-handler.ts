import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { IToolHandler, IJiraClient, ToolResult, GetTicketArgs } from '../types/index.js';

/**
 * Handler for the get_jira_ticket tool.
 * Follows SRP by only handling ticket retrieval.
 * Follows DIP by depending on IJiraClient abstraction.
 */
export class GetJiraTicketHandler implements IToolHandler {
  readonly definition: Tool = {
    name: 'get_jira_ticket',
    description: 'Fetch a Jira ticket by ID',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: {
          type: 'string',
          description: 'Jira ticket ID (e.g. PROJ-123)'
        },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional fields to expand'
        },
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional fields to include in response'
        }
      },
      required: ['ticket_id']
    }
  };

  constructor(private readonly jiraClient: IJiraClient) {}

  validate(args: unknown): args is GetTicketArgs {
    if (typeof args !== 'object' || args === null) {
      return false;
    }

    const candidate = args as Record<string, unknown>;
    
    if (typeof candidate['ticket_id'] !== 'string') {
      return false;
    }

    if (candidate['expand'] !== undefined && !this.isStringArray(candidate['expand'])) {
      return false;
    }

    if (candidate['fields'] !== undefined && !this.isStringArray(candidate['fields'])) {
      return false;
    }

    return true;
  }

  async execute(args: unknown): Promise<ToolResult> {
    if (!this.validate(args)) {
      return {
        content: [{ type: 'text', text: 'Invalid arguments for get_jira_ticket' }],
        isError: true
      };
    }

    const ticket = await this.jiraClient.getTicket(
      args.ticket_id,
      args.expand,
      args.fields
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(ticket, null, 2)
      }]
    };
  }

  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }
}
