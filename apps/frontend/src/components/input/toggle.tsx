import { HTMLProps, forwardRef } from 'react';

import ErrorMessage from './error-message';

type ToggleElement = HTMLInputElement;
type ToggleProps = {
  label: string;
  errorMessage?: string;
} & HTMLProps<ToggleElement>;

const Toggle = forwardRef<ToggleElement, ToggleProps>(
  ({ label, errorMessage, ...props }, ref) => {
    return (
      <div className="form-control w-full max-w-xs">
        <label className="label cursor-pointer">
          <span className="label-text">{label}</span>
          <input type="checkbox" className="toggle" {...props} ref={ref} />
          <ErrorMessage errorMessage={errorMessage} />
        </label>
      </div>
    );
  },
);

Toggle.displayName = 'Toggle';

export default Toggle;
