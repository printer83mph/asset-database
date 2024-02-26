import { Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

export default function Root() {
  return (
    <Container maxW={'container.xl'}>
      <Outlet />
    </Container>
  );
}
