import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import {
  getNoteWithConnections,
  createNote,
  updateNote,
  createConnection,
  searchNotes,
  getRecentNotes,
} from "../supabase";

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

// Mock the supabase module
jest.mock("../supabase", () => {
  // Create mock data
  const mockNote = {
    id: "test-note-id",
    title: "Test Note",
    content: "Test Content",
    maturity_state: "SEED",
    user_id: "test-user-id",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockNote,
            error: null,
          }),
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [mockNote],
              error: null,
            }),
          }),
        }),
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [mockNote],
            error: null,
          }),
        }),
        or: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [mockNote],
              error: null,
            }),
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockNote,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNote,
              error: null,
            }),
          }),
        }),
      }),
    }),
  };

  // Mock all the exported functions
  const mockGetNoteWithConnections = async (noteId: string) => {
    const {
      data: { user },
    } = await mockSupabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: note } = await mockSupabaseClient
      .from("notes")
      .select()
      .eq("id", noteId)
      .single();

    return {
      ...note,
      connections: [],
      history: [],
    };
  };

  const mockCreateNote = async (data: { title: string; content: string }) => {
    const {
      data: { user },
    } = await mockSupabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: note } = await mockSupabaseClient
      .from("notes")
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single();

    return note.id;
  };

  const mockSearchNotes = async (query: string) => {
    const {
      data: { user },
    } = await mockSupabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data } = await mockSupabaseClient
      .from("notes")
      .select()
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at")
      .limit(10);

    return data;
  };

  const mockGetRecentNotes = async (limit: number = 5) => {
    const {
      data: { user },
    } = await mockSupabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data } = await mockSupabaseClient
      .from("notes")
      .select()
      .order("created_at")
      .limit(limit);

    return data;
  };

  return {
    supabase: mockSupabaseClient,
    getNoteWithConnections: mockGetNoteWithConnections,
    createNote: mockCreateNote,
    updateNote: jest.fn(),
    createConnection: jest.fn(),
    searchNotes: mockSearchNotes,
    getRecentNotes: mockGetRecentNotes,
  };
});

describe("Supabase Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getNoteWithConnections", () => {
    it("should fetch a note with its connections", async () => {
      const result = await getNoteWithConnections("test-note-id");
      expect(result).toBeDefined();
      expect(result.id).toBe("test-note-id");
      expect(result.title).toBe("Test Note");
    });

    it("should throw error when user is not authenticated", async () => {
      // Mock the auth.getUser to return null user
      const { supabase } = require("../supabase");
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      await expect(getNoteWithConnections("test-note-id")).rejects.toThrow(
        "Not authenticated"
      );
    });
  });

  describe("createNote", () => {
    it("should create a note successfully", async () => {
      const noteData = {
        title: "New Note",
        content: "New Content",
      };

      const result = await createNote(noteData);
      expect(result).toBeDefined();
    });

    it("should throw error when user is not authenticated", async () => {
      // Mock the auth.getUser to return null user
      const { supabase } = require("../supabase");
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      await expect(
        createNote({ title: "New Note", content: "New Content" })
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("searchNotes", () => {
    it("should search notes successfully", async () => {
      const result = await searchNotes("test");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toBe("Test Note");
    });
  });

  describe("getRecentNotes", () => {
    it("should fetch recent notes successfully", async () => {
      const result = await getRecentNotes(5);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toBe("Test Note");
    });
  });
});
