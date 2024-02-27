import { Link } from 'react-router-dom';
import { trpc } from '../../../utils/trpc';
import { HiArrowRight } from 'react-icons/hi2';

export default function AssetList() {
  const { data, error, isLoading } = trpc.asset.list.useSWR();

  console.log(data);

  if (error) {
    // TODO
    return null;
  }

  if (isLoading || !data) {
    // TODO
    return null;
  }

  return (
    <table className="table table-zebra">
      <thead>
        <tr>
          <td>Path</td>
          <td>Display Name</td>
          <td>Keywords</td>
        </tr>
      </thead>
      <tbody>
        {data.map(({ path, displayName, keywords }) => (
          <tr key={path}>
            <td>
              <code>{path}</code>
            </td>
            <td>{displayName}</td>
            <td>
              <ul className="flex gap-1">
                {keywords?.map((keyword) => (
                  <li className="badge bg-base-200" key={keyword}>
                    {keyword}
                  </li>
                ))}
              </ul>
            </td>
            <td>
              <Link
                to={`/dashboard/assets/${path}`}
                className="btn btn-ghost btn-sm"
              >
                Details <HiArrowRight />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
