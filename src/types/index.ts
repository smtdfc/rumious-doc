declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

export type PageMap = Record<string, PageMap | null>;
