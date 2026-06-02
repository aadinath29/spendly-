import { CategoryIcon } from '../lib/icons.jsx';

export default function CategoryPill({ name, color, icon }) {
  if (!name) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
        Uncategorized
      </span>
    );
  }
  const c = color || '#64748b';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${c}22`, color: c }}
    >
      <CategoryIcon name={icon} size={13} />
      {name}
    </span>
  );
}
