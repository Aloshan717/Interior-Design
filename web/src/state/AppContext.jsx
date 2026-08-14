import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '../lib/storage/index.js';
import { createProject, touch, migrate } from '../lib/models/project.js';

const AppContext = createContext(null);

/**
 * حالة التطبيق + الحفظ التلقائي (البند ٢٦).
 * لا يوجد زر «حفظ» في أي شاشة — كل تغيير يُكتب خلال ٤٠٠ms.
 */
export function AppProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    storage
      .listProjects()
      .then((list) => setProjects(list.map(migrate)))
      .catch(() => setProjects([]))
      .finally(() => setReady(true));
  }, []);

  // الحفظ التلقائي — مؤجَّل قليلاً حتى لا نكتب عند كل ضغطة مفتاح
  useEffect(() => {
    if (!active) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      storage.saveProject(active).catch(() => {});
      setProjects((list) => {
        const rest = list.filter((p) => p.projectId !== active.projectId);
        return [active, ...rest];
      });
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [active]);

  const api = useMemo(
    () => ({
      projects,
      active,
      ready,

      createNew() {
        const project = createProject();
        setActive(project);
        return project;
      },

      async openProject(projectId) {
        const stored = await storage.getProject(projectId);
        if (stored) setActive(migrate(stored));
        return stored;
      },

      closeProject() {
        // نضمن كتابة آخر تغيير قبل الإغلاق
        if (active) storage.saveProject(active).catch(() => {});
        setActive(null);
      },

      /** كل تعديل على المشروع يمر من هنا */
      update(patch) {
        setActive((current) => (current ? touch(current, patch) : current));
      },

      /** للتعديلات التي تحتاج قراءة الحالة السابقة */
      updateWith(fn) {
        setActive((current) => (current ? touch(current, fn(current)) : current));
      },

      async deleteProject(projectId) {
        await storage.deleteProject(projectId);
        setProjects((list) => list.filter((p) => p.projectId !== projectId));
        setActive((current) => (current?.projectId === projectId ? null : current));
      },

      async clearAll() {
        await storage.clearAll();
        setProjects([]);
        setActive(null);
      },
    }),
    [projects, active, ready],
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp خارج AppProvider');
  return ctx;
}
