import { Box, Button } from '@chakra-ui/react';
import { useState } from 'react';

import { trpc } from '../../utils/trpc';

export default function AssetsPage() {
  const { trigger: createAsset } = trpc.asset.create.useSWRMutation();

  const [assetPath, setAssetPath] = useState('');
  const { data, error } = trpc.asset.get.useSWR({ path: assetPath });

  return (
    <div>
      <Button
        onClick={async () => {
          await createAsset({
            asset: {
              path: 'troll:big:mode',
              displayName: 'Bigmode Troll Asset',
            },
            initialVersion: { changes: 'Initial upload', semver: '1.0.0' },
          });
          console.log('created!');
        }}
      >
        Create asset
      </Button>

      <Box mt={20}>
        <input
          type="text"
          value={assetPath}
          onChange={(evt) => setAssetPath(evt.target.value)}
        />
        <p>{error ? error.message : `${JSON.stringify(data)}` ?? 'No data'}</p>
      </Box>
    </div>
  );
}
