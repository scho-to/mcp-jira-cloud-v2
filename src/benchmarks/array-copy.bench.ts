import { describe, test } from 'vitest';

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

  test('Small Registry (10 tools)', async ({ bench }) => {
    await bench.compare(
      bench('Spread', () => {
        [...smallRegistry.getAllTools()];
      }),
      bench('Direct', () => {
        smallRegistry.getAllTools();
      })
    );
  });

  test('Medium Registry (100 tools)', async ({ bench }) => {
    await bench.compare(
      bench('Spread', () => {
        [...mediumRegistry.getAllTools()];
      }),
      bench('Direct', () => {
        mediumRegistry.getAllTools();
      })
    );
  });

  test('Large Registry (1000 tools)', async ({ bench }) => {
    await bench.compare(
      bench('Spread', () => {
        [...largeRegistry.getAllTools()];
      }),
      bench('Direct', () => {
        largeRegistry.getAllTools();
      })
    );
  });
});
