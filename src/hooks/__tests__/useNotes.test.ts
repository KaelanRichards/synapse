import { renderHook, act } from "@testing-library/react";
import { useNotes } from "../useNotes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

// Mock user
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
};

// Create base mock implementations
const createBaseMockClient = () => ({
  select: jest.fn(() => ({
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
  insert: jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  update: jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  })),
});

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => createBaseMockClient()),
};

// Mock the hooks
jest.mock("@supabase/auth-helpers-react", () => ({
  useSupabaseClient: jest.fn(),
  useUser: jest.fn(),
}));

describe("useNotes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (useUser as jest.Mock).mockReturnValue(mockUser);
  });

  it("should initialize without errors", () => {
    const { result } = renderHook(() => useNotes());
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it("should fetch notes successfully", async () => {
    const mockNotes = [
      {
        id: "1",
        title: "Test Note",
        content: "Test Content",
        maturityState: "SEED",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        userId: mockUser.id,
      },
    ];

    const mockClient = createBaseMockClient();
    mockClient.select = jest.fn(() => ({
      order: jest.fn().mockResolvedValue({
        data: mockNotes,
        error: null,
      }),
    }));
    mockSupabaseClient.from.mockReturnValue(mockClient);

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      const notes = await result.current.fetchNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0]).toMatchObject({
        id: "1",
        title: "Test Note",
        content: "Test Content",
        maturityState: "SEED",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        userId: mockUser.id,
      });
    });

    expect(mockClient.select).toHaveBeenCalled();
  });

  it("should create note successfully", async () => {
    const mockNote = {
      id: "123",
      title: "Test Note",
      content: "Test Content",
      maturityState: "SEED",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      userId: mockUser.id,
    };

    const mockClient = createBaseMockClient();
    mockClient.insert = jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      })),
    }));
    mockSupabaseClient.from.mockReturnValue(mockClient);

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      const note = await result.current.createNote("New Note", "New Content");
      expect(note).toMatchObject({
        id: "123",
        title: "Test Note",
        content: "Test Content",
        maturityState: "SEED",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        userId: mockUser.id,
      });
    });

    expect(mockClient.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "New Note",
        content: "New Content",
        maturityState: "SEED",
      }),
    ]);
  });

  it("should handle errors when fetching notes", async () => {
    const mockError = new Error("Failed to fetch");
    const mockClient = createBaseMockClient();
    mockClient.select = jest.fn(() => ({
      order: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    }));
    mockSupabaseClient.from.mockReturnValue(mockClient);

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      const notes = await result.current.fetchNotes();
      expect(notes).toEqual([]);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe("Failed to fetch");
  });

  it("should return empty array when user is not authenticated", async () => {
    (useUser as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      const notes = await result.current.fetchNotes();
      expect(notes).toEqual([]);
    });

    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });
});
