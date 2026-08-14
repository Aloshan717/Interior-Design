import { StoredImage, Badge } from './ui.jsx';
import { relativeDate } from '../lib/format.js';
import { t } from '../i18n/index.js';

/** بطاقة المشروع — البند ٦: صورة، اسم، نوع، آخر تعديل، حالة */
export default function ProjectCard({ project, onOpen, onDelete }) {
  return (
    <button className="card card--tap" onClick={() => onOpen(project.projectId)}>
      <div style={{ position: 'relative' }}>
        {project.coverImageId ? (
          <StoredImage
            imageKey={project.coverImageId}
            className="pick__media"
            alt={project.projectName}
          />
        ) : (
          <div className="pick__media skeleton" />
        )}
        <div style={{ position: 'absolute', top: 'var(--s-2)', insetInlineStart: 'var(--s-2)' }}>
          <Badge tone={project.status === 'completed' ? 'accent' : undefined}>
            {t(`status.${project.status}`)}
          </Badge>
        </div>
      </div>

      <div style={{ padding: 'var(--s-3) var(--s-4) var(--s-4)' }}>
        <div className="row-between">
          <div style={{ minWidth: 0 }}>
            <div className="heading" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {project.projectName || t(`roomType.${project.roomType ?? 'other'}`)}
            </div>
            <div className="small faint">
              {project.roomType ? t(`roomType.${project.roomType}`) : '—'} ·{' '}
              {relativeDate(project.updatedAt)}
            </div>
          </div>
          {onDelete && (
            <span
              className="iconbtn"
              role="button"
              tabIndex={0}
              aria-label={t('common.delete')}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.projectId);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  onDelete(project.projectId);
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
