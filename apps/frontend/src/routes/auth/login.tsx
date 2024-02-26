import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  Heading,
  Link,
  Stack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userSchema } from 'validation/src/main';
import z from 'zod';

import ControlledTextInput from '../../components/form/controlled-text-input';
import { trpc } from '../../utils/trpc';

const signupSchema = userSchema.pick({ pennkey: true, password: true });
type FormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const { trigger: login } = trpc.auth.login.useSWRMutation();
  const { mutate: mutateMe } = trpc.auth.me.useSWR();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { pennkey: '', password: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ pennkey, password }) => {
    await login({ pennkey, password });
    await mutateMe();
    navigate('/');
  };

  return (
    <Container mt={40}>
      <Card>
        <CardHeader>
          <Heading>Log In</Heading>
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
            <Link as={RouterLink} to={'/auth/signup'} textDecor="underline">
              Don&apos;t have an account? Sign up here.
            </Link>
          </Center>
        </CardBody>
      </Card>
    </Container>
  );
}
