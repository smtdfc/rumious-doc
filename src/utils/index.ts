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
