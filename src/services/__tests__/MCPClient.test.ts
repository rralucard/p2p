import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPClient } from '../MCPClient';
import { ErrorType } from '../../types';

describe('MCPClient', () => {
  let mcpClient: MCPClient;

  beforeEach(() => {
    mcpClient = MCPClient.getInstance();
    // Reset window.mcpClient for each test
    (window as any).mcpClient = undefined;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = MCPClient.getInstance();
      const instance2 = MCPClient.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully in development mode', async () => {
      // Set development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await expect(mcpClient.initialize()).resolves.toBeUndefined();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should initialize with real MCP client when available', async () => {
      // Mock window.mcpClient
      (window as any).mcpClient = {
        callTool: vi.fn()
      };

      await expect(mcpClient.initialize()).resolves.toBeUndefined();
    });
  });

  describe('callTool', () => {
    it('should call real MCP client when available', async () => {
      const mockCallTool = vi.fn().mockResolvedValue({ success: true });
      (window as any).mcpClient = {
        callTool: mockCallTool
      };

      await mcpClient.initialize();
      const result = await mcpClient.callTool('geocode', { address: 'test' });

      expect(mockCallTool).toHaveBeenCalledWith('google-maps', 'geocode', { address: 'test' });
      expect(result).toEqual({ success: true });
    });

    it('should return mock response in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await mcpClient.callTool('geocode', { address: 'test address' });

      expect(result).toHaveProperty('results');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toHaveProperty('formatted_address', 'test address');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle search_places mock correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await mcpClient.callTool('search_places', { query: 'restaurant' });

      expect(result).toHaveProperty('results');
      expect(result.results).toHaveLength(2);
      expect(result.results[0].name).toContain('restaurant');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle get_place_details mock correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await mcpClient.callTool('get_place_details', { place_id: 'test_id' });

      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('place_id', 'test_id');
      expect(result.result).toHaveProperty('name');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle get_directions mock correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await mcpClient.callTool('get_directions', {
        origin: '39.9042,116.4074',
        destination: '39.9142,116.4174'
      });

      expect(result).toHaveProperty('routes');
      expect(result.routes[0]).toHaveProperty('legs');

      process.env.NODE_ENV = originalEnv;
    });

    it('should throw error for unknown tool', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await expect(mcpClient.callTool('unknown_tool', {})).rejects.toThrow('Unknown tool: unknown_tool');

      process.env.NODE_ENV = originalEnv;
    });
  });
});