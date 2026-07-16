import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Project } from '../types';
import {
  deleteProject as del,
  loadProjects,
  upsertProject,
} from '../store/storage';

type ProjectContextValue = {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  saveProject: (project: Project) => void;
  removeProject: (id: string) => void;
  refresh: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = useCallback(() => {
    setProjects(loadProjects());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProject = useCallback((project: Project) => {
    setProjects((prev) => upsertProject(prev, project));
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjects((prev) => del(prev, id));
  }, []);

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const value = useMemo(
    () => ({ projects, getProject, saveProject, removeProject, refresh }),
    [projects, getProject, saveProject, removeProject, refresh],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
