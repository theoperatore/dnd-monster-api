declare module 'markdown-to-json' {
  type M2JOptions = {
    width: number;
    content: boolean;
    outfile?: string;
    minify?: boolean;
  };

  export function parse(filenames: string[], options: M2JOptions): string | undefined;
}
