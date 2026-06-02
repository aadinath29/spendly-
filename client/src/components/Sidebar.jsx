import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Tags, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/categories', label: 'Categories', icon: Tags },
];

const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${mobileOpen ? '' : 'hidden'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-5">
          <div className="bg-brand-gradient grid h-9 w-9 place-items-center rounded-xl shadow-lg">
            <Wallet size={18} className="text-white" />
          </div>
          <div>
            <div className="text-base font-bold leading-none text-white">Spendly</div>
            <div className="mt-1 text-[11px] text-slate-400">Expense Tracker</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="bg-brand-gradient absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full" />
                  )}
                  <item.icon size={18} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="bg-brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white">
              {initials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-200">{user?.name}</div>
              <div className="truncate text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
