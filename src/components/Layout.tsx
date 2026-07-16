import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Shield,
  BookOpen,
  FlaskConical,
  PlusCircle,
  Calculator,
  Coins,
  Library,
  Award,
} from 'lucide-react';
import { VectorBackground } from './VectorBackground';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tokenize', label: 'Tokenizar IA', icon: Coins },
  { to: '/registry', label: 'Registro tokens', icon: Library },
  { to: '/standard', label: 'Estándar FIST278', icon: Award },
  { to: '/projects', label: 'Pipeline IP', icon: GitBranch },
  { to: '/new', label: 'Nueva IP', icon: PlusCircle },
  { to: '/mathlab', label: 'Math Lab', icon: Calculator },
  { to: '/postquantum', label: 'Lab Post-Cuántico', icon: Shield },
  { to: '/methodology', label: 'Metodología', icon: FlaskConical },
  { to: '/knowledge', label: 'Base de conocimiento', icon: BookOpen },
];

export function Layout() {
  return (
    <>
      <VectorBackground />
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark" style={{ fontSize: '0.7rem', letterSpacing: '-0.02em' }}>
              F278
            </div>
            <div>
              <h1>FIST278</h1>
              <p>HashCod International Standard</p>
            </div>
          </div>

          <nav className="nav">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <strong>Certified by HashCod</strong>
            <div style={{ marginTop: 6 }}>
              Estándar internacional FIST278
              <br />
              Validación solo con certificado HVC
            </div>
          </div>
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
