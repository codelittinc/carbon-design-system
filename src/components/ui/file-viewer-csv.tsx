"use client";

import type { ReactElement } from "react";
import { Alert } from "./alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { TableEmptyRow } from "./table-empty-row";
import { CSV_ROW_CAP, shapeCsvRows, type CsvTable } from "@/lib/file-viewer";

/**
 * CSV for `FileViewer`. Internal, not exported.
 *
 * papaparse handles quoted delimiters, quotes and newlines and guesses the
 * delimiter. It is imported on demand, so it ships only once somebody opens a
 * CSV, and it stops reading after the row cap.
 */
export async function parseCsv(text: string): Promise<CsvTable> {
  const mod: typeof import("papaparse") & { default?: typeof import("papaparse") } = await import("papaparse");
  // A CommonJS module: some bundlers hand it over as `default`, some as the namespace.
  const Papa = mod.default ?? mod;
  const result = Papa.parse<string[]>(text, {
    delimiter: "",
    delimitersToGuess: [",", ";", "\t", "|"],
    skipEmptyLines: "greedy",
    // The header, the cap, and one row more to know the file is longer.
    preview: CSV_ROW_CAP + 2,
  });
  return shapeCsvRows(result.data);
}

export function CsvView({ table }: { table: CsvTable }): ReactElement {
  return (
    <>
      {table.truncated && (
        <div className="mx-4 mt-4">
          <Alert variant="info">Showing the first 1,000 rows. Download the file to see all of it.</Alert>
        </div>
      )}
      {/* DataTable's wrapper: a wide file scrolls sideways in here only. */}
      <div className="m-4 overflow-x-auto rounded-lg border border-border bg-surface">
        <Table className="w-auto min-w-full">
          <TableHeader>
            <TableRow>
              {table.header.map((cell, i) => (
                // Headers are the file's words, not UI labels: no eyebrow upper-casing.
                <TableHead key={i} className="whitespace-nowrap normal-case tracking-normal">
                  {cell}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.length === 0 ? (
              <TableEmptyRow colSpan={Math.max(table.header.length, 1)}>
                This file has a header row but no data rows.
              </TableEmptyRow>
            ) : (
              table.rows.map((row, r) => (
                <TableRow key={r}>
                  {row.map((cell, c) => (
                    <TableCell key={c} className="max-w-xs whitespace-pre-wrap break-words align-top">
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
