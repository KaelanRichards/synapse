import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

// Mock user for testing
export const mockUser = {
  id: "123",
  email: "test@example.com",
  createdAt: "2024-01-01T00:00:00.000Z",
  appMetadata: {},
  userMetadata: {},
};

// Type for mock query response
type MockQueryResponse = {
  data: any;
  error: any;
  count: any;
  then: (resolve: (value: any) => any) => Promise<any>;
  catch: () => Promise<any>;
};

// Create mock functions with proper chaining
const createMockQuery = () => {
  const query: MockQueryResponse = {
    data: null,
    error: null,
    count: null,
    then: (resolve) => Promise.resolve(resolve(query)),
    catch: () => Promise.resolve(query),
  };

  const mockFn = jest.fn().mockReturnValue(query);

  return {
    fn: mockFn,
    query,
  };
};

// Mock Supabase client for testing
export const mockSupabaseClient = {
  from: jest.fn(() => {
    const { query: selectQuery, fn: selectFn } = createMockQuery();
    const { query: orderQuery, fn: orderFn } = createMockQuery();
    const { query: singleQuery, fn: singleFn } = createMockQuery();
    const { query: insertQuery, fn: insertFn } = createMockQuery();
    const { query: updateQuery, fn: updateFn } = createMockQuery();
    const { query: eqQuery, fn: eqFn } = createMockQuery();

    return {
      select: jest.fn(() => ({
        ...selectQuery,
        order: orderFn.mockReturnValue({
          ...orderQuery,
          or: jest.fn().mockReturnValue(orderQuery),
          eq: jest.fn().mockReturnValue(orderQuery),
          single: singleFn.mockReturnValue(singleQuery),
        }),
      })),
      insert: jest.fn(() => ({
        ...insertQuery,
        select: jest.fn(() => ({
          ...selectQuery,
          single: singleFn.mockReturnValue(singleQuery),
        })),
      })),
      update: updateFn.mockReturnValue({
        ...updateQuery,
        eq: eqFn.mockReturnValue({
          ...eqQuery,
          select: jest.fn(() => ({
            ...selectQuery,
            single: singleFn.mockReturnValue(singleQuery),
          })),
        }),
      }),
    };
  }),
};

// Helper to set mock response
export const setMockResponse = (response: {
  data?: any;
  error?: any;
}): MockQueryResponse => {
  return {
    data: response.data ?? null,
    error: response.error ?? null,
    count: null,
    then: (resolve) =>
      Promise.resolve(
        resolve({ data: response.data, error: response.error, count: null })
      ),
    catch: () =>
      Promise.resolve({ data: null, error: response.error, count: null }),
  };
};

// Custom render function that includes providers
function render(
  ui: React.ReactElement,
  { mockUserData = mockUser, ...options } = {}
) {
  // Mock Supabase hooks
  (useSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  (useUser as jest.Mock).mockReturnValue(mockUserData);

  return rtlRender(ui, { ...options });
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
