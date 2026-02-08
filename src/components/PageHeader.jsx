import { Link } from 'react-router-dom';

export default function PageHeader({ icon: Icon, title, description, breadcrumb }) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
      {breadcrumb && (
        <nav className="text-xs text-slate-400 dark:text-slate-500 mb-1">
          <Link to="/" className="hover:text-brand-500">Dashboard</Link>
          {' › '}
          {Array.isArray(breadcrumb)
            ? breadcrumb.map((item, i) => {
                const isLast = i === breadcrumb.length - 1;
                return (
                  <span key={i}>
                    {isLast
                      ? <span>{item.label}</span>
                      : <><Link to={item.path} className="hover:text-brand-500">{item.label}</Link>{' › '}</>
                    }
                  </span>
                );
              })
            : <span>{breadcrumb}</span>
          }
        </nav>
      )}
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <Icon className="text-brand-600" size={22} />
        {title}
      </h1>
      {description && (
        <p className="hidden sm:block text-slate-500 dark:text-slate-400 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
