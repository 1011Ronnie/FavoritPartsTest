import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './server'

// Node's fetch requires absolute URLs; browsers resolve the relative API path themselves.
const NativeRequest = globalThis.Request
globalThis.Request = class extends NativeRequest {
  constructor(input, init) {
    super(typeof input === 'string' ? new URL(input, window.location.origin) : input, init)
  }
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
afterAll(() => {
  server.close()
  globalThis.Request = NativeRequest
})
