import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { userSchema } from 'validation/src/main';
import z from 'zod';

import TextInput from '../../components/input/text-input';
import { trpc } from '../../utils/trpc';

const loginSchema = userSchema.pick({ pennkey: true, password: true });
type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { trigger: login } = trpc.auth.login.useSWRMutation();
  const { mutate: mutateMe } = trpc.auth.me.useSWR();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { pennkey: '', password: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await login(data);
    await mutateMe();
    navigate('/dashboard');
  };

  return (
    <div className="mt-12 mx-auto w-full max-w-xs">
      <h1 className="text-4xl font-bold tracking-tight">Log In</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
        <TextInput
          {...register('pennkey')}
          placeholder="janedoe"
          label="PennKey"
        />
        <TextInput
          {...register('password')}
          type="password"
          placeholder="••••••••"
          label="Password"
        />
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </form>
      <Link to={'/auth/signup'} className="link block mt-8 text-center w-full">
        Don&apos;t have an account? Sign up here.
      </Link>
    </div>
  );
}
