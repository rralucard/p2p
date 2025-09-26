// Test setup file
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(process, 'env', {
  value: {
    NODE_ENV: 'test'
  }
})

// Mock window object for MCP client
Object.defineProperty(window, 'mcpClient', {
  value: undefined,
  writable: true
})