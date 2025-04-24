import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from './jira-client.js';

class JiraRequesterServer {
  private server: Server;
  private jiraClient: JiraClient;

  constructor() {
    this.server = new Server(
      {
        name: 'jira-requester',
        version: '1.0.0'
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.jiraClient = new JiraClient();
    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[Jira Requester Error]', error);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
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
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_jira_ticket') {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }

      interface JiraTicketArgs {
        ticket_id: string;
        expand?: string[];
        fields?: string[];
      }

      const isValidArgs = (args: unknown): args is JiraTicketArgs => 
        typeof args === 'object' && 
        args !== null && 
        'ticket_id' in args && 
        typeof (args as JiraTicketArgs).ticket_id === 'string' &&
        (args as JiraTicketArgs).expand === undefined || Array.isArray((args as JiraTicketArgs).expand) &&
        (args as JiraTicketArgs).fields === undefined || Array.isArray((args as JiraTicketArgs).fields);

      if (!isValidArgs(request.params.arguments)) {
        throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_jira_ticket');
      }

      try {
        const ticket = await this.jiraClient.getTicket(
          request.params.arguments.ticket_id, 
          request.params.arguments.expand,
          request.params.arguments.fields
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(ticket, null, 2)
          }]
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Jira API error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Jira Requester MCP server running on stdio');
  }
}

const server = new JiraRequesterServer();
server.run().catch(console.error);
