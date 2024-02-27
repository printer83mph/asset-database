import { Link } from 'react-router-dom';

export default function AssetsPage() {
  return (
    <div>
      <Link to="new" className="link">
        New Asset
      </Link>
    </div>
  );
}
