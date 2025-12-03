import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Result content item for tool responses.
 */
export interface ToolContentItem {
  readonly type: 'text' | 'image' | 'resource';
  readonly text?: string;
  readonly data?: string;
  readonly mimeType?: string;
}

/**
 * Result of executing a tool.
 */
export interface ToolResult {
  readonly content: readonly ToolContentItem[];
  readonly isError?: boolean;
}

/**
 * Interface for tool handlers.
 * Follows SRP by defining a single responsibility: handling tool execution.
 * Follows OCP by allowing new tools to be added without modifying existing code.
 */
export interface IToolHandler {
  /** The tool definition for MCP registration */
  readonly definition: Tool;
  
  /** Execute the tool with given arguments */
  execute(args: unknown): Promise<ToolResult>;
  
  /** Validate the arguments before execution */
  validate(args: unknown): boolean;
}

/**
 * Interface for tool registry.
 * Follows OCP by allowing tools to be registered dynamically.
 */
export interface IToolRegistry {
  register(handler: IToolHandler): void;
  getHandler(toolName: string): IToolHandler | undefined;
  getAllTools(): readonly Tool[];
}
