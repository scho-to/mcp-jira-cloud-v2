import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from './jira-client.js';
import { createJiraConfigFromEnv } from './config/index.js';
import { ToolRegistry, GetJiraTicketHandler } from './tools/index.js';
import type { IToolRegistry, IJiraClient } from './types/index.js';

/**
 * MCP Server for Jira integration.
 * Follows SRP by delegating tool handling to the registry.
 * Follows DIP by depending on abstractions (IToolRegistry, IJiraClient).
 * Follows OCP by allowing new tools to be registered without modification.
 */
class JiraRequesterServer {
  private readonly server: Server;
  private readonly toolRegistry: IToolRegistry;

  /**
   * Creates a new JiraRequesterServer.
   * @param jiraClient - Jira client for API operations (DIP)
   * @param toolRegistry - Registry for tool handlers (DIP)
   */
  constructor(jiraClient: IJiraClient, toolRegistry: IToolRegistry) {
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

    this.toolRegistry = toolRegistry;
    this.registerTools(jiraClient);
    this.setupRequestHandlers();
    
    this.server.onerror = (error) => console.error('[Jira Requester Error]', error);
  }

  /**
   * Registers all available tools.
   * Follows OCP - add new tools here without modifying other methods.
   */
  private registerTools(jiraClient: IJiraClient): void {
    this.toolRegistry.register(new GetJiraTicketHandler(jiraClient));
    // Add more tool handlers here as needed
  }

  /**
   * Sets up MCP request handlers.
   * Follows SRP by only handling MCP protocol concerns.
   */
  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [...this.toolRegistry.getAllTools()]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const handler = this.toolRegistry.getHandler(request.params.name);
      
      if (!handler) {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }

      if (!handler.validate(request.params.arguments)) {
        throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for ${request.params.name}`);
      }

      try {
        const result = await handler.execute(request.params.arguments);
        return {
          content: [...result.content]
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Jira API error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Jira Requester MCP server running on stdio');
  }
}

/**
 * Application entry point.
 * Composition root - creates and wires all dependencies.
 */
function main(): void {
  const config = createJiraConfigFromEnv();
  const jiraClient = new JiraClient(config);
  const toolRegistry = new ToolRegistry();
  
  const server = new JiraRequesterServer(jiraClient, toolRegistry);
  server.run().catch(console.error);
}

main();
