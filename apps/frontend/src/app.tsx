import { useState } from 'react';
import { trpc } from './utils/trpc';
import LoginPage from './routes/login';
import SignupPage from './routes/signup';
import Me from './routes/me';

function App() {
  const [client] = useState(() => trpc.createClient());

  return (
    <trpc.Provider client={client}>
      <LoginPage />
      <SignupPage />
      <Me />
    </trpc.Provider>
  );
}

export default App;
