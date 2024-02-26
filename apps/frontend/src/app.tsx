import { useState } from 'react';
import { trpc } from './utils/trpc';
import LoginPage from './routes/login';

function App() {
  const [client] = useState(() => trpc.createClient());

  return (
    <trpc.Provider client={client}>
      <LoginPage />
    </trpc.Provider>
  );
}

export default App;
