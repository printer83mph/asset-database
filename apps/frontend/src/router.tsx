import { createBrowserRouter } from 'react-router-dom';

import AssetsPage from './routes/dashboard/assets/assets';
import NewAssetPage from './routes/dashboard/assets/new/page';
import DashboardLayout from './routes/dashboard/layout';
import DashboardPage from './routes/dashboard/page';
import RootLayout from './routes/root';
import LoginPage from './routes/auth/login';
import SignupPage from './routes/auth/signup';
import HomePage from './routes/page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'auth',
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { path: '', element: <DashboardPage /> },
          {
            path: 'assets',
            children: [
              { path: '', element: <AssetsPage /> },
              { path: 'new', element: <NewAssetPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
