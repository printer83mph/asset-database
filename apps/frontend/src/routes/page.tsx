import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container mx-auto mt-6">
      <Link to="/auth/login" className="link">
        Login
      </Link>
    </div>
  );
}
