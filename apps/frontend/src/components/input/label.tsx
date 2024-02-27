export default function Label({
  label,
  error,
}: {
  label?: string;
  error?: boolean;
}) {
  return label ? (
    <div
      className={`text-sm mb-1 transition-colors ${error ? 'text-error' : ''}`}
    >
      {label}
    </div>
  ) : null;
}
