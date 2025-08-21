export function className(
  ...args: (string | Record<string, boolean> | undefined | null)[]
): string {
  return args
    .map((arg) => {
      if (!arg) return '';
      if (typeof arg === 'string') return arg;
      return Object.entries(arg)
        .filter(([_, val]) => val)
        .map(([key]) => key)
        .join(' ');
    })
    .filter(Boolean)
    .join(' ');
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}