import { useState } from 'react';
import TabBar from './components/TabBar.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import ProjectsScreen from './screens/ProjectsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import Wizard from './screens/Wizard.jsx';
import { useApp } from './state/AppContext.jsx';
import { t } from './i18n/index.js';

export default function App() {
  const { projects, active, ready, createNew, openProject, deleteProject, clearAll } = useApp();
  const [tab, setTab] = useState('home');

  if (!ready) return <div className="app" />;

  // المشروع المفتوح يغطي الشاشة كاملة — لا تبويبات أثناء الرحلة
  if (active) {
    return (
      <div className="app">
        <Wizard />
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'home' && (
        <HomeScreen
          projects={projects}
          onNew={createNew}
          onOpen={openProject}
          onSeeAll={() => setTab('projects')}
        />
      )}

      {tab === 'projects' && (
        <ProjectsScreen
          projects={projects}
          onOpen={openProject}
          onNew={createNew}
          onDelete={(id) => {
            if (window.confirm(t('projects.deleteConfirm'))) deleteProject(id);
          }}
        />
      )}

      {tab === 'settings' && <SettingsScreen projects={projects} onClearAll={clearAll} />}

      <TabBar current={tab} onChange={setTab} />
    </div>
  );
}
