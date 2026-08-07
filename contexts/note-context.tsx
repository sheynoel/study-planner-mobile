import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { ApiClientError, getApiErrorMessage } from '@/lib/api/api-client';
import type { CreateNoteRequest, Note, NoteFilters, UpdateNoteRequest } from '@/lib/api/note.types';
import { createNote as createNoteRequest, deleteNote as deleteNoteRequest, getNote as getNoteRequest, getNotes, updateNote as updateNoteRequest } from '@/lib/api/notes';

type ListStatus = 'idle' | 'loading' | 'success' | 'error';
type NoteContextValue = { notes: Note[]; listStatus: ListStatus; listError: string | null; loadNotes: (filters?: NoteFilters) => Promise<Note[]>; loadNote: (id: string) => Promise<Note>; getCachedNote: (id: string) => Note | undefined; createNote: (request: CreateNoteRequest) => Promise<Note>; updateNote: (id: string, request: UpdateNoteRequest) => Promise<Note>; deleteNote: (id: string) => Promise<void> };
const NoteContext = createContext<NoteContextValue | null>(null);

export function NoteProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]); const [listStatus, setListStatus] = useState<ListStatus>('idle'); const [listError, setListError] = useState<string | null>(null);
  const runAuthenticated = useCallback(async <T,>(request: (token: string) => Promise<T>) => { if (!accessToken) throw new Error('Your session is unavailable. Please sign in again.'); try { return await request(accessToken); } catch (error) { if (error instanceof ApiClientError && error.status === 401) await logout(); throw error; } }, [accessToken, logout]);
  const upsert = useCallback((note: Note) => setNotes((current) => current.some((item) => item.id === note.id) ? current.map((item) => item.id === note.id ? note : item) : [note, ...current]), []);
  const loadNotes = useCallback(async (filters: NoteFilters = {}) => { setListStatus('loading'); setListError(null); try { const loaded = (await runAuthenticated((token) => getNotes(token, filters))).data.notes; setNotes(loaded); setListStatus('success'); return loaded; } catch (error) { setListError(getApiErrorMessage(error)); setListStatus('error'); throw error; } }, [runAuthenticated]);
  const loadNote = useCallback(async (id: string) => { const note = (await runAuthenticated((token) => getNoteRequest(token, id))).data.note; upsert(note); return note; }, [runAuthenticated, upsert]);
  const createNote = useCallback(async (request: CreateNoteRequest) => { const note = (await runAuthenticated((token) => createNoteRequest(token, request))).data.note; upsert(note); return note; }, [runAuthenticated, upsert]);
  const updateNote = useCallback(async (id: string, request: UpdateNoteRequest) => { const note = (await runAuthenticated((token) => updateNoteRequest(token, id, request))).data.note; upsert(note); return note; }, [runAuthenticated, upsert]);
  const deleteNote = useCallback(async (id: string) => { await runAuthenticated((token) => deleteNoteRequest(token, id)); setNotes((current) => current.filter((note) => note.id !== id)); }, [runAuthenticated]);
  const getCachedNote = useCallback((id: string) => notes.find((note) => note.id === id), [notes]);
  const value = useMemo(() => ({ notes, listStatus, listError, loadNotes, loadNote, getCachedNote, createNote, updateNote, deleteNote }), [createNote, deleteNote, getCachedNote, listError, listStatus, loadNote, loadNotes, notes, updateNote]);
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes(): NoteContextValue { const context = useContext(NoteContext); if (!context) throw new Error('useNotes must be used inside NoteProvider.'); return context; }
