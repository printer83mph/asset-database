import { AnimatePresence, motion } from 'framer-motion';

export default function ErrorMessage({
  errorMessage,
}: {
  errorMessage?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {errorMessage && (
        <motion.em
          className="block overflow-y-hidden text-sm mt-1 text-error"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
        >
          {errorMessage}.
        </motion.em>
      )}
    </AnimatePresence>
  );
}
