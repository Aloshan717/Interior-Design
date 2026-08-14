import Icon from '../components/Icon.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { Button, EmptyState, Notice, SectionTitle } from '../components/ui.jsx';
import { isStorageEphemeral } from '../lib/storage/index.js';
import { brand } from '../theme/brand.js';
import { t } from '../i18n/index.js';

/** الشاشة الرئيسية — البند ٦: زر واضح + آخر المشاريع، بلا ازدحام */
export default function HomeScreen({ projects, onNew, onOpen, onSeeAll }) {
  const recent = projects.slice(0, 4);

  return (
    <div className="screen">
      <header style={{ marginBottom: 'var(--s-6)' }}>
        <p className="small faint">{t('home.greeting')}</p>
        <h1 className="display" style={{ marginTop: 2 }}>
          {brand.tagline}
        </h1>
        <p className="body soft" style={{ marginTop: 'var(--s-2)' }}>
          {t('home.subtitle')}
        </p>
      </header>

      <Button block onClick={onNew}>
        <Icon name="plus" size={20} />
        {t('home.newDesign')}
      </Button>

      {isStorageEphemeral() && (
        <div className="mt-4">
          <Notice>{t('home.ephemeral')}</Notice>
        </div>
      )}

      {recent.length > 0 ? (
        <>
          <SectionTitle
            action={
              projects.length > recent.length && (
                <button className="small accent" onClick={onSeeAll}>
                  {t('home.seeAll')}
                </button>
              )
            }
          >
            {t('home.myProjects')}
          </SectionTitle>
          <div className="grid-2">
            {recent.map((project) => (
              <ProjectCard key={project.projectId} project={project} onOpen={onOpen} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState title={t('home.emptyTitle')} body={t('home.emptyBody')} />
        </div>
      )}
    </div>
  );
}
