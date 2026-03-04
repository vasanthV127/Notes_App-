import React, { useState } from 'react';

export default function TagFilter({ tags, activeTag, onSelect, onCreateTag, onDeleteTag }) {
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onCreateTag(trimmed);
      setNewTag('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-filter">
      <h3 className="sidebar-heading">Tags</h3>

      {error && <p className="tag-filter__error">{error}</p>}

      <ul className="tag-list">
        <li>
          <button
            className={`sidebar-link ${activeTag === null ? 'active' : ''}`}
            onClick={() => onSelect(null)}
          >
            🏷️ All Tags
          </button>
        </li>
        {tags.map((tag) => (
          <li key={tag.id} className="tag-list__item">
            <button
              className={`sidebar-link ${activeTag === tag.id ? 'active' : ''}`}
              onClick={() => onSelect(tag.id)}
            >
              # {tag.name}
            </button>
            <button
              className="tag-list__delete"
              title="Delete tag"
              onClick={() => onDeleteTag(tag.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Inline create */}
      <div className="tag-create">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="New tag…"
          className="tag-create__input"
        />
        <button
          className="btn btn-outline btn-sm"
          onClick={handleCreate}
          disabled={loading || !newTag.trim()}
        >
          {loading ? '…' : '+'}
        </button>
      </div>
    </div>
  );
}
