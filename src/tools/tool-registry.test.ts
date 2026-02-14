import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolRegistry } from './tool-registry.js';
import type { IToolHandler } from '../types/index.js';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;
  let mockHandler: IToolHandler;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockHandler = {
      definition: {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      validate: vi.fn(),
      execute: vi.fn(),
    };
  });

  it('should register a new tool', () => {
    registry.register(mockHandler);
    expect(registry.getHandler('test_tool')).toBe(mockHandler);
  });

  it('should throw error when registering a duplicate tool', () => {
    registry.register(mockHandler);
    expect(() => registry.register(mockHandler)).toThrow(
      "Tool 'test_tool' is already registered"
    );
  });

  it('should return undefined for non-existent tool', () => {
    expect(registry.getHandler('non_existent')).toBeUndefined();
  });

  it('should return all registered tools definitions', () => {
    const mockHandler2: IToolHandler = {
        definition: {
          name: 'test_tool_2',
          description: 'Another test tool',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        validate: vi.fn(),
        execute: vi.fn(),
      };

    registry.register(mockHandler);
    registry.register(mockHandler2);

    const tools = registry.getAllTools();
    expect(tools).toHaveLength(2);
    expect(tools).toContain(mockHandler.definition);
    expect(tools).toContain(mockHandler2.definition);
  });
});
