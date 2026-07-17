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
  ClipboardList,
  Terminal,
} from 'lucide-react';
import { VectorBackground } from './VectorBackground';
import { HashcodIcon } from './HashcodIcon';

const links = [
  { to: '/', label: 'Σ-DASH', icon: LayoutDashboard, end: true },
  { to: '/ops', label: 'Ω-CONSOLE', icon: Terminal },
  { to: '/registration', label: 'Δ-100F DOSSIER', icon: ClipboardList },
  { to: '/tokenize', label: 'Φ-TOKEN FORGE', icon: Coins },
  { to: '/registry', label: 'Λ-REGISTRY', icon: Library },
  { to: '/standard', label: 'Ψ-NORM FIST278', icon: Award },
  { to: '/projects', label: 'Γ-IP PIPELINE', icon: GitBranch },
  { to: '/new', label: 'Γ-NEW IP', icon: PlusCircle },
  { to: '/mathlab', label: 'μ-MATH LATTICE', icon: Calculator },
  { to: '/postquantum', label: 'ρ-PQC LAB', icon: Shield },
  { to: '/methodology', label: 'ξ-METHODOLOGY', icon: FlaskConical },
  { to: '/knowledge', label: 'κ-KB', icon: BookOpen },
];

export function Layout() {
  return (
    <>
      <VectorBackground />
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark brand-mark-icon" title="hashcod">
              <HashcodIcon size={28} variant="white" />
            </div>
            <div>
              <h1>FIST278</h1>
              <p>hashcod · HVC-LATTICE/Ω-4.2</p>
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
            <strong>Π_pass ⇔ K_hvc ∧ gates*</strong>
            <div style={{ marginTop: 6 }}>
              Manual PDF requerido
              <br />
              /docs/FIST278-OPERATOR-MANUAL.pdf
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
