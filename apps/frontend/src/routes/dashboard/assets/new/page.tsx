import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  NewAssetForm,
  NewAssetFormSubmitHandler,
} from '../../../../components/forms/new-asset-form';
import { trpc } from '../../../../utils/trpc';

export default function NewAssetPage() {
  const { trigger: triggerCreate } = trpc.asset.create.useSWRMutation();
  const navigate = useNavigate();

  const onSubmit: NewAssetFormSubmitHandler = async ({
    asset,
    hasInitialVersion,
    initialVersion,
  }) => {
    const id = toast.loading('Creating asset...');
    await triggerCreate(
      {
        asset: {
          ...asset,
          keywords: asset.keywords.map(({ keyword }) => keyword),
        },
        initialVersion: hasInitialVersion
          ? {
              ...initialVersion,
              changes: 'Initial version',
              semver: '0.1.0',
            }
          : undefined,
      },
      {
        onSuccess() {
          toast.success('Successfully created asset!', { id });
          navigate('/dashboard/assets');
        },
        onError(err) {
          if (err.data?.httpStatus === 400)
            toast.error(err.message, {
              id,
            });
          else toast.error(`An unknown error occurred.`, { id });
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center">
      <article className="w-full max-w-xs">
        <h1 className="text-3xl font-bold tracking-tight">Create New Asset</h1>
        <NewAssetForm className="mt-6" onSubmit={onSubmit} />
      </article>
    </div>
  );
}
