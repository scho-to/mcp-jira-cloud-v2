import { bench, describe } from 'vitest';

// Simulate the ToolRegistry and Tool structures
interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

interface IToolHandler {
  definition: Tool;
}

class ToolRegistry {
  private readonly handlers = new Map<string, IToolHandler>();

  constructor(count: number) {
    for (let i = 0; i < count; i++) {
      const name = `tool-${i}`;
      this.handlers.set(name, {
        definition: {
          name,
          description: `Description for ${name}`,
          inputSchema: {}
        }
      });
    }
  }

  getAllTools(): readonly Tool[] {
    return Array.from(this.handlers.values()).map(h => h.definition);
  }
}

describe('ListTools Handler Optimization', () => {
  const smallRegistry = new ToolRegistry(10);
  const mediumRegistry = new ToolRegistry(100);
  const largeRegistry = new ToolRegistry(1000);

  bench('Small Registry (10 tools) - Spread', () => {
    return [...smallRegistry.getAllTools()];
  });

  bench('Small Registry (10 tools) - Direct', () => {
    return smallRegistry.getAllTools();
  });

  bench('Medium Registry (100 tools) - Spread', () => {
    return [...mediumRegistry.getAllTools()];
  });

  bench('Medium Registry (100 tools) - Direct', () => {
    return mediumRegistry.getAllTools();
  });

  bench('Large Registry (1000 tools) - Spread', () => {
    return [...largeRegistry.getAllTools()];
  });

  bench('Large Registry (1000 tools) - Direct', () => {
    return largeRegistry.getAllTools();
  });
});
