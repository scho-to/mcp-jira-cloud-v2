import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { IToolHandler, IToolRegistry } from '../types/index.js';

/**
 * Registry for tool handlers.
 * Follows SRP by only managing tool registration.
 * Follows OCP by allowing new tools to be added without modification.
 */
export class ToolRegistry implements IToolRegistry {
  private readonly handlers = new Map<string, IToolHandler>();
  private cachedTools: readonly Tool[] | undefined;

  register(handler: IToolHandler): void {
    const toolName = handler.definition.name;
    if (this.handlers.has(toolName)) {
      throw new Error(`Tool '${toolName}' is already registered`);
    }
    this.handlers.set(toolName, handler);
    this.cachedTools = undefined;
  }

  getHandler(toolName: string): IToolHandler | undefined {
    return this.handlers.get(toolName);
  }

  getAllTools(): readonly Tool[] {
    if (!this.cachedTools) {
      const tools: Tool[] = new Array(this.handlers.size);
      let i = 0;
      for (const h of this.handlers.values()) {
        tools[i++] = h.definition;
      }
      this.cachedTools = tools;
    }
    return this.cachedTools;
  }
}
