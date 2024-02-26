import { useState } from 'react';
import { trpc } from './utils/trpc';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  const [client] = useState(() => trpc.createClient());

  return (
    <trpc.Provider client={client}>
      <RouterProvider router={router} />
    </trpc.Provider>
  );
}

export default App;
