import React from 'react';

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive }) {
  const { id, title, content, tags, is_pinned, is_archived, updated_at } = note;

  const formattedDate = new Date(updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className={`note-card ${is_pinned ? 'note-card--pinned' : ''} ${is_archived ? 'note-card--archived' : ''}`}>
      {/* Header */}
      <div className="note-card__header">
        <h3 className="note-card__title" title={title}>
          {title || 'Untitled'}
        </h3>
        <div className="note-card__actions">
          <button
            className={`icon-btn ${is_pinned ? 'active' : ''}`}
            title={is_pinned ? 'Unpin' : 'Pin'}
            onClick={() => onTogglePin(note)}
          >
            {is_pinned ? '📌' : '📍'}
          </button>
          <button
            className={`icon-btn ${is_archived ? 'active' : ''}`}
            title={is_archived ? 'Unarchive' : 'Archive'}
            onClick={() => onToggleArchive(note)}
          >
            {is_archived ? '📤' : '📦'}
          </button>
        </div>
      </div>

      {/* Content preview */}
      <p className="note-card__content">
        {content ? (content.length > 120 ? content.slice(0, 120) + '…' : content) : (
          <span className="note-card__empty">No content</span>
        )}
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="note-card__tags">
          {tags.map((tag) => (
            <span key={tag.id} className="tag-badge">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="note-card__footer">
        <time className="note-card__date">{formattedDate}</time>
        <div className="note-card__btns">
          <button className="btn btn-sm btn-outline" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
