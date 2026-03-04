import React, { useState, useEffect } from 'react';

const EMPTY = {
  title: '',
  content: '',
  is_pinned: false,
  is_archived: false,
  tag_ids: [],
};

export default function NoteModal({ note, tags, onSave, onClose, onCreateTag }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [tagLoading, setTagLoading] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (note) {
      setForm({
        title: note.title || '',
        content: note.content || '',
        is_pinned: note.is_pinned || false,
        is_archived: note.is_archived || false,
        tag_ids: note.tags?.map((t) => t.id) || [],
      });
    } else {
      setForm(EMPTY);
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleTag = (id) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(id)
        ? prev.tag_ids.filter((t) => t !== id)
        : [...prev.tag_ids, id],
    }));
  };

  const handleAddTag = async () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setTagLoading(true);
    try {
      const created = await onCreateTag(trimmed);
      setForm((prev) => ({ ...prev, tag_ids: [...prev.tag_ids, created.id] }));
      setNewTag('');
    } catch (err) {
      setError(err.message);
    } finally {
      setTagLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>{note ? 'Edit Note' : 'New Note'}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Note title…"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              rows={6}
              value={form.content}
              onChange={handleChange}
              placeholder="Write your note here…"
            />
          </div>

          {/* Toggles */}
          <div className="form-row form-row--checks">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_pinned"
                checked={form.is_pinned}
                onChange={handleChange}
              />
              📌 Pin note
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_archived"
                checked={form.is_archived}
                onChange={handleChange}
              />
              📦 Archive note
            </label>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tag-picker">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`tag-badge tag-badge--selectable ${form.tag_ids.includes(tag.id) ? 'selected' : ''}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            {/* Create new tag inline */}
            <div className="tag-add-row">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="New tag name…"
                className="tag-add-input"
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddTag}
                disabled={tagLoading || !newTag.trim()}
              >
                {tagLoading ? '…' : '+ Add'}
              </button>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
