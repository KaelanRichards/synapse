// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Add console debugging
beforeAll(() => {
  console.log("Test environment setup starting...");
});

afterAll(() => {
  console.log("Test environment teardown complete.");
});

// Mock Supabase
jest.mock("@supabase/auth-helpers-react", () => {
  console.log("Mocking Supabase...");
  return {
    useSupabaseClient: jest.fn(),
    useUser: jest.fn(),
  };
});

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
}));

// Reset all mocks before each test
beforeEach(() => {
  console.log("Clearing mocks...");
  jest.clearAllMocks();
});
