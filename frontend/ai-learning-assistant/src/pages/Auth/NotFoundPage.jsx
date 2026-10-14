import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main className="empty-page"><span className="eyebrow">404 · Page not found</span><h1>That page isn’t here.</h1><Link className="btn btn-primary" to="/">Go to your study space</Link></main>;
}
