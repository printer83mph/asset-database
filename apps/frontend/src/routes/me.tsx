import { trpc } from '../utils/trpc';

export default function Me() {
  const { data, error, mutate } = trpc.auth.me.useSWR();
  return (
    <>
      <button type="button" onClick={() => mutate()}>
        Get Me
      </button>
      <div>data:{JSON.stringify(data)}</div>
      <div>error:{JSON.stringify(error)}</div>
    </>
  );
}
