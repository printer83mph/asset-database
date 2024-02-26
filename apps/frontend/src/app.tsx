import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';

import router from './router';
import { trpc } from './utils/trpc';

function App() {
  const [client] = useState(() => trpc.createClient());

  return (
    <trpc.Provider client={client}>
      <RouterProvider router={router} />
    </trpc.Provider>
  );
}

export default App;
