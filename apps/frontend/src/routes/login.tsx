import { SubmitHandler, useForm } from 'react-hook-form';

import { trpc } from '../utils/trpc';

interface FormValues {
  pennkey: string;
  password: string;
}

export default function LoginPage() {
  const { trigger: login } = trpc.auth.login.useSWRMutation();

  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async ({ pennkey, password }) => {
    await login({ pennkey, password });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="janedoe" {...register('pennkey')} />
      <input type="password" placeholder="janedoe1" {...register('password')} />
      <button type="submit">Submit</button>
    </form>
  );
}
