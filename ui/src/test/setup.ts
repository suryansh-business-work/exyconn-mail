import "@testing-library/react";
import { vi, beforeAll, afterAll } from "vitest";

// Mock API calls to prevent network errors in tests
vi.mock("./services/api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { success: true, data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } } })),
    post: vi.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true, message: "Deleted" } })),
  },
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("API Error") ||
        args[0].includes("Failed to fetch") ||
        args[0].includes("Network Error"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

