import {
  FormControl,
  FormErrorMessage,
  Input,
  InputProps,
  FormLabel,
} from '@chakra-ui/react';
import { Control, FieldValues, Path, useFormState } from 'react-hook-form';

export default function ControlledTextInput<
  TFieldValues extends FieldValues,
  TPath extends Path<TFieldValues>,
>({
  control,
  path,
  type = 'text',
  label,
  ...props
}: {
  control: Control<TFieldValues>;
  path: TPath;
  label?: string;
} & InputProps) {
  const { errors } = useFormState({ control, name: path });
  return (
    <FormControl isInvalid={!!errors[path]}>
      <FormLabel fontSize="smaller" mb={1} color="GrayText">
        {label}
      </FormLabel>
      <Input type={type} {...props} {...control.register(path)} />
      <FormErrorMessage>
        {errors[path] && `${errors[path]?.message}.`}
      </FormErrorMessage>
    </FormControl>
  );
}
