import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { userSchema } from 'validation/src/main';
import z from 'zod';

import TextInput from '../../components/input/text-input';
import { trpc } from '../../utils/trpc';
import Label from '../../components/input/label';
import toast from 'react-hot-toast';

const signupSchema = userSchema;
type FormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { trigger: signup } = trpc.auth.signup.useSWRMutation();
  const { trigger: login } = trpc.auth.login.useSWRMutation();
  const { mutate: mutateMe } = trpc.auth.me.useSWR();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { pennkey: '', password: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await signup(data, {
      async onSuccess() {
        await login(
          { pennkey: data.pennkey, password: data.password },
          {
            onSuccess() {
              mutateMe({ pennkey: data.pennkey, school: data.school });
              navigate('/dashboard');
            },
            onError(err) {
              if (err.data?.httpStatus === 400) toast.error(`${err.message}.`);
              else toast.error('An unknown error occurred.');
            },
          },
        );
      },
      onError(err) {
        if (err.data?.httpStatus === 400) toast.error(`${err.message}.`);
        else toast.error('An unknown error occurred.');
      },
    });
  };

  return (
    <div className="mt-12 mx-auto w-full max-w-xs">
      <h1 className="text-4xl font-bold tracking-tight">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6 mt-8">
          <TextInput
            {...register('pennkey')}
            errorMessage={errors.pennkey?.message}
            placeholder="janedoe"
            label="PennKey"
          />
          <TextInput
            {...register('password')}
            errorMessage={errors.password?.message}
            type="password"
            placeholder="••••••••"
            label="Password"
          />
          <TextInput
            {...register('name')}
            errorMessage={errors.name?.message}
            placeholder="Jane Doe"
            label="Name"
          />
          <label className="block">
            <Label label="School" />
            <select
              {...register('school')}
              className="select select-bordered w-full max-w-xs"
            >
              <option value="none">None</option>
              <option value="cas">CAS</option>
              <option value="seas">SEAS</option>
              <option value="wharton">Wharton</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full mt-8"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </form>
      <Link to={'/auth/login'} className="link block mt-8 text-center w-full">
        Already have an account? Log in here.
      </Link>
    </div>
  );
}
