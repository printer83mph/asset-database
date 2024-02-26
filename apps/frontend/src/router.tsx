import { createBrowserRouter } from 'react-router-dom';

import AssetsPage from './routes/assets/assets';
import LoginPage from './routes/auth/login';
import SignupPage from './routes/auth/signup';
import Root from './routes/root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '',
        element: <>Home page (awesome)</>,
      },
      {
        path: 'auth',
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
      {
        path: 'assets',
        children: [{ path: '', element: <AssetsPage /> }],
      },
    ],
  },
]);

export default router;
