import React, { useState, useEffect, useCallback } from 'react';
import { notesApi, tagsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import TagFilter from '../components/TagFilter';

export default function Dashboard() {
  const { user } = useAuth();

  // ── Data state ────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  // ── Fetch tags ────────────────────────────────────────────────────────────
  const fetchTags = useCallback(async () => {
    try {
      const { data } = await tagsApi.list();
      setTags(data.results ?? data);
    } catch {
      // non-critical
    }
  }, []);

  // ── Fetch notes ───────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search) params.search = search;
      if (activeTag) params.tag = activeTag;
      if (showArchived) params.is_archived = true;
      else params.is_archived = false;

      const { data } = await notesApi.list(params);
      setNotes(data.results ?? data);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
    } catch {
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, activeTag, showArchived, page]);

  useEffect(() => { fetchTags(); }, [fetchTags]);
  useEffect(() => { setPage(1); }, [search, activeTag, showArchived]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditingNote(null); setModalOpen(true); };
  const openEdit = (note) => { setEditingNote(note); setModalOpen(true); };

  const handleSave = async (formData) => {
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, formData);
      } else {
        await notesApi.create(formData);
      }
      setModalOpen(false);
      fetchNotes();
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not save note.';
      throw new Error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesApi.remove(id);
      fetchNotes();
    } catch {
      setError('Failed to delete note.');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await notesApi.patch(note.id, { is_pinned: !note.is_pinned });
      fetchNotes();
    } catch {
      setError('Could not update note.');
    }
  };

  const handleToggleArchive = async (note) => {
    try {
      await notesApi.patch(note.id, { is_archived: !note.is_archived });
      fetchNotes();
    } catch {
      setError('Could not update note.');
    }
  };

  const handleCreateTag = async (name) => {
    try {
      const { data } = await tagsApi.create({ name });
      setTags((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || 'Could not create tag.';
      throw new Error(msg);
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      await tagsApi.remove(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      if (activeTag === id) setActiveTag(null);
    } catch {
      setError('Could not delete tag.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);

  return (
    <div className="app-layout">
      <Navbar user={user} />

      <div className="dashboard">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <button className="btn btn-primary btn-full" onClick={openCreate}>
            + New Note
          </button>

          <div className="sidebar-section">
            <button
              className={`sidebar-link ${!showArchived ? 'active' : ''}`}
              onClick={() => setShowArchived(false)}
            >
              📄 All Notes
            </button>
            <button
              className={`sidebar-link ${showArchived ? 'active' : ''}`}
              onClick={() => setShowArchived(true)}
            >
              📦 Archived
            </button>
          </div>

          <TagFilter
            tags={tags}
            activeTag={activeTag}
            onSelect={setActiveTag}
            onCreateTag={handleCreateTag}
            onDeleteTag={handleDeleteTag}
          />
        </aside>

        {/* ── Main ────────────────────────────────────────────────────── */}
        <main className="main-content">
          {/* Search bar */}
          <div className="search-bar">
            <input
              type="search"
              placeholder="Search notes by title or content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-state">Loading notes…</div>
          ) : (
            <>
              {/* Pinned */}
              {pinnedNotes.length > 0 && (
                <section>
                  <h2 className="section-title">📌 Pinned</h2>
                  <div className="notes-grid">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All / Others */}
              <section>
                {pinnedNotes.length > 0 && (
                  <h2 className="section-title">Others</h2>
                )}
                {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
                  <div className="empty-state">
                    <p>No notes yet. Click <strong>+ New Note</strong> to get started!</p>
                  </div>
                ) : (
                  <div className="notes-grid">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Pagination */}
              {(pagination.next || pagination.previous) && (
                <div className="pagination">
                  <button
                    className="btn btn-outline"
                    disabled={!pagination.previous}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span className="pagination-info">Page {page}</span>
                  <button
                    className="btn btn-outline"
                    disabled={!pagination.next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Note modal */}
      {modalOpen && (
        <NoteModal
          note={editingNote}
          tags={tags}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          onCreateTag={handleCreateTag}
        />
      )}
    </div>
  );
}
