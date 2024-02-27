import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <Link to="/dashboard/assets" className="link link-primary">
      Assets
    </Link>
  );
}
