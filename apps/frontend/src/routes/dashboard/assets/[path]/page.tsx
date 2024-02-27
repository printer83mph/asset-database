import { Link, useParams } from 'react-router-dom';
import { pathSchema } from 'validation/src/semantics';
import { trpc } from '../../../../utils/trpc';
import { HiArrowDownTray, HiArrowLeft } from 'react-icons/hi2';
import { useEffect, useState } from 'react';

export default function AssetViewPage() {
  const { path } = useParams<{ path: string }>();
  const { data, error, isLoading } = trpc.asset.get.useSWR({
    path: path || '',
  });

  const [versionDL, setVersionDL] = useState('');
  const { data: fileData } = trpc.version.getFile.useSWR({
    assetPath: path || '',
    semver: versionDL,
  });

  if (!pathSchema.safeParse(path).success) {
    // TODO
    return <div>Invalid path.</div>;
  }

  if (error) {
    // TODO
    return <div>Could not load asset.</div>;
  }

  if (isLoading || !data) {
    // TODO
    return <div>Loading...</div>;
  }

  const {
    asset: { description, displayName, keywords },
    versions,
  } = data;
  return (
    <main className="card card-bordered bg-base-200">
      <div className="card-body">
        <Link
          to=".."
          className="inline-flex items-center gap-2 link-hover text-base-content/50 -mt-2"
        >
          <HiArrowLeft />
          Assets
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-4">
          {displayName}
        </h1>
        <h2>
          <code>{path}</code>
        </h2>
        <ul className="flex gap-1 mt-1">
          {keywords?.map((keyword) => (
            <li className="badge bg-base-300" key={keyword}>
              {keyword}
            </li>
          )) || <span className="text-base-content/50">No keywords</span>}
        </ul>
        <div className="divider" />
        <div className="space-y-6">
          {fileData && <img src={`${fileData.fileContents}`} alt="Preview" />}
          {description && <p>{description}</p>}
          <div>
            <h3 className="text-xl font-semibold">Versions</h3>
            <table className="table">
              <thead>
                <tr>
                  <td>semver</td>
                  <td>changes</td>
                  <td>author</td>
                  <td>file id</td>
                </tr>
              </thead>
              <tbody>
                {versions.map(({ semver, changes, author, reference }) => (
                  <tr key={semver}>
                    <td>v{semver}</td>
                    <td>{changes}</td>
                    <td>{author}</td>
                    <td>{reference}</td>
                    <td>
                      <button
                        type="button"
                        className="ml-auto btn btn-outline flex items-center gap-2"
                        onClick={() => {
                          setVersionDL(semver);
                        }}
                      >
                        <HiArrowDownTray />
                        Download/Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
