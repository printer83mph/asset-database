/**
 * Specify only fields `K` as optional.
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
