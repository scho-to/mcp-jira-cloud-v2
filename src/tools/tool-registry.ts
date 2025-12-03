import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { IToolHandler, IToolRegistry } from '../types/index.js';

/**
 * Registry for tool handlers.
 * Follows SRP by only managing tool registration.
 * Follows OCP by allowing new tools to be added without modification.
 */
export class ToolRegistry implements IToolRegistry {
  private readonly handlers = new Map<string, IToolHandler>();

  register(handler: IToolHandler): void {
    const toolName = handler.definition.name;
    if (this.handlers.has(toolName)) {
      throw new Error(`Tool '${toolName}' is already registered`);
    }
    this.handlers.set(toolName, handler);
  }

  getHandler(toolName: string): IToolHandler | undefined {
    return this.handlers.get(toolName);
  }

  getAllTools(): readonly Tool[] {
    return Array.from(this.handlers.values()).map(h => h.definition);
  }
}
