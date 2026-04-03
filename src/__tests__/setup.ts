import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Runs after each test to clean up
afterEach(() => {
  cleanup()
})

// Custom matchers can be added here if needed
