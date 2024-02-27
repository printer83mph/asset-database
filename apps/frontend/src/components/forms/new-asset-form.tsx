import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { HiXMark } from 'react-icons/hi2';
import { assetSchema, versionSchema } from 'validation/src/main';
import { z } from 'zod';

import { useState } from 'react';
import Label from '../input/label';
import TextArea from '../input/text-area';
import TextInput from '../input/text-input';
import Toggle from '../input/toggle';

const newAssetSchema = z.object({
  asset: assetSchema.extend({
    keywords: z.array(z.object({ keyword: z.string().min(1) })),
  }),
  hasInitialVersion: z.boolean(),
  initialVersion: versionSchema.omit({
    assetPath: true,
    author: true,
    changes: true,
  }),
});

type NewAssetFormData = z.infer<typeof newAssetSchema>;
export type NewAssetFormSubmitHandler = SubmitHandler<NewAssetFormData>;

const createDefaultValues = () =>
  ({
    asset: { displayName: '', keywords: [], path: '', description: '' },
    hasInitialVersion: true,
    initialVersion: { semver: '0.1.0' },
  }) satisfies NewAssetFormData;

export function NewAssetForm({
  className = '',
  onSubmit,
}: {
  className?: string;
  onSubmit: NewAssetFormSubmitHandler;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewAssetFormData>({
    defaultValues: createDefaultValues(),
    resolver: zodResolver(newAssetSchema),
  });

  const hasInitialVersion = watch('hasInitialVersion');

  const {
    fields: keywords,
    append: appendKeyword,
    remove: removeKeyword,
  } = useFieldArray({ control, name: 'asset.keywords' });

  const [keywordText, setKeywordText] = useState('');

  function appendCurrentKeyword() {
    const formatted = keywordText.trim().toLowerCase();
    if (
      formatted.length === 0 ||
      keywords.findIndex(({ keyword }) => keyword === formatted) !== -1
    )
      return;
    appendKeyword({ keyword: formatted });
    setKeywordText('');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="space-y-6">
        <TextInput
          {...register('asset.path')}
          label="Path"
          errorMessage={errors.asset?.path?.message}
          placeholder="project:scene:asset"
        />
        <TextInput
          {...register('asset.displayName')}
          label="Display Name"
          errorMessage={errors.asset?.displayName?.message}
          placeholder="My Awesome Asset"
        />
        <TextArea
          {...register('asset.description')}
          label="Description"
          errorMessage={errors.asset?.description?.message}
          placeholder=""
        />
        <label className="block">
          <Label label="Keywords" />
          <div className="relative w-full max-w-xs">
            <TextInput
              value={keywordText}
              onChange={(evt) =>
                setKeywordText((evt.target as HTMLInputElement).value)
              }
              onKeyDownCapture={(evt) => {
                if (evt.key !== 'Enter') return;
                evt.preventDefault();
                appendCurrentKeyword();
              }}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <button
                type="button"
                className="btn btn-sm mr-2"
                disabled={keywordText.length === 0}
                onClick={appendCurrentKeyword}
              >
                Add
              </button>
            </div>
          </div>
          <ul className="mt-4 flex flex-wrap w-full max-w-xs gap-1">
            {keywords.map(({ id, keyword }, index) => (
              <li key={id}>
                <button
                  className="btn btn-ghost btn-sm inline-flex font-normal"
                  onClick={() => {
                    removeKeyword(index);
                  }}
                >
                  {keyword}
                  <HiXMark />
                </button>
              </li>
            ))}
          </ul>
        </label>
      </div>
      <div className="mt-6">
        <Toggle
          {...register('hasInitialVersion')}
          label="Has initial version?"
        />
      </div>
      {hasInitialVersion && (
        <div className="pt-6">
          <TextInput
            {...register('initialVersion.semver')}
            label="Semantic Version"
            errorMessage={errors['initialVersion']?.semver?.message}
            placeholder="0.1.0"
          />
        </div>
      )}
      <button type="submit" className="btn btn-primary w-full max-w-xs mt-6">
        Submit
      </button>
    </form>
  );
}
