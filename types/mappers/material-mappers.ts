/**
 * Material Type Mappers
 * 
 * Mapper functions to transform API material responses to domain types.
 */

import type { Material, Note, MaterialWithNotes } from '../domain/material';

/**
 * API response type for material data
 */
export interface MaterialResponse {
  id: number;
  title: string;
  content: string;
  source: string;
  type: string;
  description: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * API response type for note data
 */
export interface NoteResponse {
  id: number;
  title: string | null;
  content: string;
  material_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * API response type for material with notes
 */
export interface MaterialWithNotesResponse extends MaterialResponse {
  notes: NoteResponse[];
}

/**
 * Maps API material response to domain Material type
 * 
 * @param response - API material response
 * @returns Domain Material object
 * 
 * @example
 * ```typescript
 * const material = mapMaterialResponse(apiResponse);
 * ```
 */
export const mapMaterialResponse = (response: MaterialResponse): Material => ({
  id: response.id,
  title: response.title,
  content: response.content,
  source: response.source,
  type: response.type as 'article' | 'document' | 'video' | 'audio' | 'other',
  description: response.description,
  url: response.url,
  created_at: response.created_at,
  updated_at: response.updated_at,
});

/**
 * Maps API note response to domain Note type
 * 
 * @param response - API note response
 * @returns Domain Note object
 * 
 * @example
 * ```typescript
 * const note = mapNoteResponse(apiResponse);
 * ```
 */
export const mapNoteResponse = (response: NoteResponse): Note => ({
  id: response.id,
  title: response.title,
  content: response.content,
  material_id: response.material_id,
  user_id: response.user_id,
  created_at: response.created_at,
  updated_at: response.updated_at,
});

/**
 * Maps API material with notes response to domain MaterialWithNotes type
 * 
 * @param response - API material with notes response
 * @returns Domain MaterialWithNotes object
 * 
 * @example
 * ```typescript
 * const materialWithNotes = mapMaterialWithNotesResponse(apiResponse);
 * ```
 */
export const mapMaterialWithNotesResponse = (response: MaterialWithNotesResponse): MaterialWithNotes => ({
  ...mapMaterialResponse(response),
  notes: response.notes.map(mapNoteResponse),
});
