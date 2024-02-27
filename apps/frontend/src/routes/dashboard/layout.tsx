import { Link, Outlet, useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useEffect } from 'react';

export default function DashboardLayout() {
  const { error: meError, data: me } = trpc.auth.me.useSWR();
  const { trigger: triggerLogout } = trpc.auth.logout.useSWRMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (meError) {
      navigate('/auth/login', { replace: true });
    }
  }, [meError, navigate]);

  return (
    <div className="container mx-auto">
      <nav className="navbar bg-base-100">
        <div className="flex-1">
          <Link to="/dashboard" className="text-xl">
            Asset Database
          </Link>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src="https://placekitten.com/128/128"
                />
              </div>
            </div>
            <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                Logged in as <strong>{me?.pennkey}</strong>
              </li>
              <li>
                <button type="button" onClick={() => triggerLogout()}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
