// The slice of papaparse that FileViewer's CSV view calls. Declared here rather
// than taken from @types/papaparse, which references Node's types and would
// bring `process`, `Buffer` and the rest into a typecheck of browser code.
declare module "papaparse" {
  export interface ParseConfig {
    delimiter?: string;
    delimitersToGuess?: string[];
    skipEmptyLines?: boolean | "greedy";
    preview?: number;
  }

  export interface ParseResult<T> {
    data: T[];
  }

  export function parse<T>(input: string, config?: ParseConfig): ParseResult<T>;
}
