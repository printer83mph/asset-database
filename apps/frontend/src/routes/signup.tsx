import { SubmitHandler, useForm } from 'react-hook-form';

import { trpc } from '../utils/trpc';
import { UserSchool } from 'backend/db/schema';

interface FormValues {
  pennkey: string;
  password: string;
  name: string;
  school: UserSchool;
}

export default function SignupPage() {
  const { trigger: signup } = trpc.auth.signup.useSWRMutation();

  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async ({
    pennkey,
    password,
    name,
    school,
  }) => {
    await signup({ pennkey, password, name, school });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="janedoe" {...register('pennkey')} />
      <input type="password" placeholder="••••••••" {...register('password')} />
      <input type="text" placeholder="Jane Doe" {...register('name')} />
      <input type="text" placeholder="seas" {...register('school')} />
      <button type="submit">Submit</button>
    </form>
  );
}
