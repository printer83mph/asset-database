import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { HiXMark } from 'react-icons/hi2';
import {
  assetSchema,
  versionSchema,
  DEFAULT_SEMVER,
} from 'validation/src/main';
import { z } from 'zod';

import { useState } from 'react';
import Label from '../input/label';
import TextArea from '../input/text-area';
import TextInput from '../input/text-input';
import Toggle from '../input/toggle';
import ErrorMessage from '../input/error-message';

const newAssetSchema = z.object({
  asset: assetSchema.extend({
    keywords: z.array(z.object({ keyword: z.string().min(1) })),
  }),
  initialVersion: versionSchema
    .pick({
      semver: true,
    })
    .extend({
      fileContents: z.string().min(1, 'Please provide an asset file'),
    })
    .optional(),
});

type NewAssetFormData = z.infer<typeof newAssetSchema>;
export type NewAssetFormSubmitHandler = SubmitHandler<NewAssetFormData>;

const createDefaultValues = () =>
  ({
    asset: { displayName: '', keywords: [], path: '', description: '' },
    initialVersion: { semver: DEFAULT_SEMVER, fileContents: '' },
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
    setValue,
    watch,
  } = useForm<NewAssetFormData>({
    defaultValues: createDefaultValues(),
    resolver: zodResolver(newAssetSchema),
  });

  const initialVersionWatch = watch('initialVersion');

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
          onChange={() => {
            setValue(
              'initialVersion',
              initialVersionWatch
                ? undefined
                : { fileContents: '', semver: DEFAULT_SEMVER },
            );
          }}
          checked={!!initialVersionWatch}
          label="Has initial version?"
        />
      </div>
      {!!initialVersionWatch && (
        <div className="pt-6 space-y-6">
          <TextInput
            {...register('initialVersion.semver')}
            label="Semantic Version"
            errorMessage={errors['initialVersion']?.semver?.message}
            placeholder="0.1.0"
          />
          {/* it works don't worry LOL */}
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block">
            <Label label="Asset File" />
            <input
              onChange={async (evt) => {
                if (evt.target.files === null || evt.target.files.length === 0)
                  return;
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    resolve(reader.result as string);
                  };
                  reader.onerror = (err) => {
                    reject(err);
                  };
                  reader.readAsText(evt.target.files![0]);
                });
                setValue('initialVersion.fileContents', base64, {
                  shouldValidate: true,
                });
              }}
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
            />
            <ErrorMessage
              errorMessage={errors.initialVersion?.fileContents?.message}
            />
          </label>
        </div>
      )}
      <button type="submit" className="btn btn-primary w-full max-w-xs mt-6">
        Submit
      </button>
    </form>
  );
}
