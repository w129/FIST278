import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { TokenProvider } from './context/TokenContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tokenize } from './pages/Tokenize';
import { TokenRegistry } from './pages/TokenRegistry';
import { TokenDetail } from './pages/TokenDetail';
import { Projects } from './pages/Projects';
import { NewProject } from './pages/NewProject';
import { ProjectDetail } from './pages/ProjectDetail';
import { PostQuantumLab } from './pages/PostQuantumLab';
import { Methodology } from './pages/Methodology';
import { Knowledge } from './pages/Knowledge';
import { MathLab } from './pages/MathLab';
import { Standard } from './pages/Standard';

export default function App() {
  return (
    <TokenProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="tokenize" element={<Tokenize />} />
              <Route path="registry" element={<TokenRegistry />} />
              <Route path="tokens/:id" element={<TokenDetail />} />
              <Route path="standard" element={<Standard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="new" element={<NewProject />} />
              <Route path="mathlab" element={<MathLab />} />
              <Route path="postquantum" element={<PostQuantumLab />} />
              <Route path="methodology" element={<Methodology />} />
              <Route path="knowledge" element={<Knowledge />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TokenProvider>
  );
}
