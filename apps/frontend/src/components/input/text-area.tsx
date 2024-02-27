import { forwardRef } from 'react';
import ErrorMessage from './error-message';
import Label from './label';

type TextInputProps = {
  label?: string;
  errorMessage?: string;
} & Omit<React.HTMLProps<HTMLTextAreaElement>, 'className'>;

const TextArea = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ label, errorMessage, ...props }, ref) => {
    return (
      <label className="form-control w-full max-w-xs">
        <Label error={!!errorMessage} label={label} />
        <textarea
          className={`textarea textarea-bordered grow placeholder:text-base-content/50 ${errorMessage ? 'textarea-error' : ''}`}
          {...props}
          ref={ref}
        />
        <ErrorMessage errorMessage={errorMessage} />
      </label>
    );
  },
);

TextArea.displayName = 'TextInput';

export default TextArea;
