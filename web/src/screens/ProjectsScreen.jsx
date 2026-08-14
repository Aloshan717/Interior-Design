import ProjectCard from '../components/ProjectCard.jsx';
import { Button, EmptyState } from '../components/ui.jsx';
import { t } from '../i18n/index.js';

/** مشاريعي — البند ٢١ */
export default function ProjectsScreen({ projects, onOpen, onDelete, onNew }) {
  return (
    <div className="screen">
      <h1 className="title" style={{ marginBottom: 'var(--s-5)' }}>
        {t('projects.title')}
      </h1>

      {projects.length === 0 ? (
        <EmptyState
          title={t('projects.empty')}
          action={
            <div className="mt-4">
              <Button onClick={onNew}>{t('home.newDesign')}</Button>
            </div>
          }
        />
      ) : (
        <div className="grid-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
