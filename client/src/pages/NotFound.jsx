import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <div className="text-gradient text-7xl font-extrabold">404</div>
        <h1 className="mt-3 text-xl font-semibold text-white">Page not found</h1>
        <p className="mt-1 text-slate-400">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
