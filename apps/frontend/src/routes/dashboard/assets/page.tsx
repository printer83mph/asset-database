import { Link } from 'react-router-dom';
import AssetList from './asset-list';
import { HiCog6Tooth, HiPlus } from 'react-icons/hi2';

export default function AssetsPage() {
  return (
    <div>
      <ul className="menu lg:menu-horizontal rounded-box bg-base-200 mb-4 gap-x-2">
        <li>
          <Link to="new" className="">
            <HiPlus />
            New Asset
          </Link>
        </li>
        <li>
          <Link to="/" className="">
            <HiCog6Tooth />
            Coming Soon
          </Link>
        </li>
      </ul>
      <AssetList />
    </div>
  );
}
