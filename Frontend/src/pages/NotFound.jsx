import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-shop py-24 text-center">
      <p className="font-display text-7xl text-gold mb-2">404</p>
      <h1 className="font-display text-2xl text-ink mb-4">Page Not Found</h1>
      <p className="text-ink/60 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="inline-block bg-ink text-gold px-6 py-3 rounded-full text-sm">
        Back to Home
      </Link>
    </div>
  );
}
