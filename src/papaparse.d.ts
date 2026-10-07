// The slice of papaparse that FileViewer's CSV view calls. Declared here rather
// than taken from @types/papaparse, which references Node's types and would
// bring `process`, `Buffer` and the rest into a typecheck of browser code.
declare module "papaparse" {
  export interface ParseConfig<T> {
    delimiter?: string;
    delimitersToGuess?: string[];
    skipEmptyLines?: boolean | "greedy";
    step?: (result: StepResult<T>, parser: Parser) => void;
  }

  /** With `step`, one row at a time. */
  export interface StepResult<T> {
    data: T;
  }

  export interface Parser {
    abort(): void;
  }

  export function parse<T>(input: string, config?: ParseConfig<T>): void;
}
