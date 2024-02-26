import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Stack,
  Center,
  Link,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { userSchema } from 'validation/src/db-models';
import ControlledTextInput from '../../components/text-input';
import { trpc } from '../../utils/trpc';
import { UserSchool } from 'validation/src/semantics';

const signupSchema = userSchema;
type FormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { trigger: signup } = trpc.auth.signup.useSWRMutation();
  const { trigger: login } = trpc.auth.login.useSWRMutation();
  const { mutate: mutateMe } = trpc.auth.me.useSWR<{
    pennkey: string;
    school: UserSchool;
  }>();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { pennkey: '', password: '', name: '', school: 'seas' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    await signup(formData);
    await login({ pennkey: formData.pennkey, password: formData.password });
    mutateMe({ pennkey: formData.pennkey, school: formData.school });
    navigate('/');
  };

  return (
    <Container mt={40}>
      <Card>
        <CardHeader>
          <Heading>Sign Up</Heading>
        </CardHeader>
        <CardBody as="form" onSubmit={handleSubmit(onSubmit)} pt={0}>
          <Stack gap={4}>
            <ControlledTextInput
              control={control}
              path="pennkey"
              placeholder="janedoe"
              label="PennKey"
            />
            <ControlledTextInput
              control={control}
              path="password"
              type="password"
              placeholder="••••••••"
              label="Password"
            />
            <ControlledTextInput
              control={control}
              path="name"
              placeholder="Jane Doe"
              label="Name"
            />
          </Stack>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            mt={8}
            width={'full'}
          >
            Submit
          </Button>
          <Center mt={4}>
            <Link as={RouterLink} to={'/auth/login'} textDecor="underline">
              Already have an account? Log in here.
            </Link>
          </Center>
        </CardBody>
      </Card>
    </Container>
  );
}
