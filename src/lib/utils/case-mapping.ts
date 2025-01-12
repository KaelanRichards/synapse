import { Database } from "@/types/supabase/index";

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCase<U>}`
  : S;

type CamelToSnakeObject<T> = {
  [K in keyof T as K extends string ? SnakeCase<K> : K]: T[K];
};

type SnakeToCamelObject<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K];
};

// Database types
type DatabaseNote = Database["public"]["Tables"]["notes"]["Row"];
type DatabaseConnection = Database["public"]["Tables"]["connections"]["Row"];
type DatabaseNoteVersion = Database["public"]["Tables"]["note_versions"]["Row"];

// Frontend types (automatically derived from database types)
export type Note = SnakeToCamelObject<DatabaseNote>;
export type Connection = SnakeToCamelObject<DatabaseConnection>;
export type NoteVersion = SnakeToCamelObject<DatabaseNoteVersion>;

// Partial types for inserts
export type PartialNote = Partial<Note>;
export type PartialConnection = Partial<Connection>;
export type PartialNoteVersion = Partial<NoteVersion>;

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel<T extends Record<string, any>>(
  obj: T
): SnakeToCamelObject<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = value;
  }

  return result;
}

export function camelToSnake<T extends Record<string, any>>(
  obj: T
): CamelToSnakeObject<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    result[snakeKey] = value;
  }

  return result;
}

// Type-safe convenience functions
export const snakeToCamelNote = (note: DatabaseNote): Note =>
  snakeToCamel(note);
export const camelToSnakeNote = (note: Partial<Note>): Partial<DatabaseNote> =>
  camelToSnake(note);
export const snakeToCamelConnection = (conn: DatabaseConnection): Connection =>
  snakeToCamel(conn);
export const camelToSnakeConnection = (
  conn: Partial<Connection>
): Partial<DatabaseConnection> => camelToSnake(conn);
export const snakeToCamelNoteVersion = (
  ver: DatabaseNoteVersion
): NoteVersion => snakeToCamel(ver);
export const camelToSnakeNoteVersion = (
  ver: Partial<NoteVersion>
): Partial<DatabaseNoteVersion> => camelToSnake(ver);
