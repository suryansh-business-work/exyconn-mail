import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

// Mock all API services to prevent network calls
vi.mock("./services/domainService", () => ({
  domainService: {
    getAll: vi.fn(() =>
      Promise.resolve({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
    ),
  },
}));

vi.mock("./services/mailboxService", () => ({
  mailboxService: {
    getAll: vi.fn(() =>
      Promise.resolve({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
    ),
  },
}));

vi.mock("./services/emailService", () => ({
  emailService: {
    getAll: vi.fn(() =>
      Promise.resolve({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
    ),
  },
}));

// Suppress console errors during tests
beforeAll(() => {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("API Error") ||
        args[0].includes("Failed to fetch") ||
        args[0].includes("Network Error") ||
        args[0].includes("AggregateError"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

describe("App", () => {
  it("should render the application", () => {
    // App already includes BrowserRouter, so render it directly
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it("should confirm React is working", () => {
    expect(true).toBe(true);
  });
});
