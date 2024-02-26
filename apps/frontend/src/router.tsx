import { createBrowserRouter } from 'react-router-dom';

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
    ],
  },
]);

export default router;
