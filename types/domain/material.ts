/**
 * Material Domain Types
 * 
 * Consolidated type definitions for learning materials and notes.
 */

/**
 * Represents a learning material (article, document, etc.)
 */
export interface Material {
  /** Unique identifier for the material */
  id: number;
  /** Title of the material */
  title: string;
  /** Content of the material */
  content: string;
  /** Source or origin of the material */
  source: string;
  /** Type of material */
  type: 'article' | 'document' | 'video' | 'audio' | 'other';
  /** Optional description */
  description: string | null;
  /** Optional URL to external resource */
  url: string | null;
  /** Timestamp when the material was created */
  created_at: string;
  /** Timestamp when the material was last updated */
  updated_at: string;
}

/**
 * Represents a user's note on a material
 */
export interface Note {
  /** Unique identifier for the note */
  id: number;
  /** Optional title for the note */
  title: string | null;
  /** Content of the note */
  content: string;
  /** Material ID this note is associated with */
  material_id: number;
  /** User ID who created the note */
  user_id: number;
  /** Timestamp when the note was created */
  created_at: string;
  /** Timestamp when the note was last updated */
  updated_at: string;
}

/**
 * Represents a material with associated notes
 */
export interface MaterialWithNotes extends Material {
  /** Array of notes for this material */
  notes: Note[];
}
