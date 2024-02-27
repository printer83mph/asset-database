import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import router from './router';
import { trpc } from './utils/trpc';

function App() {
  const [client] = useState(() => trpc.createClient());

  return (
    <trpc.Provider client={client}>
      <RouterProvider router={router} />
      <Toaster
        toastOptions={{ className: 'bg-base-200 text-base-content' }}
        position="bottom-right"
      />
    </trpc.Provider>
  );
}

export default App;
