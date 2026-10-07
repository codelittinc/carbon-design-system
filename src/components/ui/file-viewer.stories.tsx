import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { FileViewer, type FileViewerFallback, type FileViewerProps } from "./file-viewer";
import { Button } from "./button";
import { Card } from "./card";
import { FileTextIcon } from "./icons";

i18n.addResourceBundle(
  "en",
  "fileViewer",
  {
    preview: "Preview",
    previewName: "Preview {{name}}",
    openFromElsewhere: "Open the contract",
    cardTitle: "Jordan Avery · Candidate",
    cardHint: "Clicking the card logs a click. Opening the résumé must not.",
    cardClicks: "Card clicks: {{count}}",
    docNote: "Formatting isn't shown for Word 97–2003 files.",
    docText:
      "Lease renewal letter\n\nDear Jordan,\n\nYour lease for Unit 4B renews on July 1, 2026 at $1,850 per month.\nPlease sign and return the enclosed addendum by June 15.\n\nThe Leasing Office",
    corruptText: "Statement of Work\n\nThe document could not be laid out, so this is the text the server extracted at upload.",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "fileViewer",
  {
    preview: "Vista previa",
    previewName: "Vista previa de {{name}}",
    openFromElsewhere: "Abrir el contrato",
    cardTitle: "Jordan Avery · Candidato",
    cardHint: "Al hacer clic en la tarjeta se registra un clic. Abrir el currículum no debe hacerlo.",
    cardClicks: "Clics en la tarjeta: {{count}}",
    docNote: "El formato no se muestra en archivos de Word 97–2003.",
    docText:
      "Carta de renovación del contrato\n\nEstimado Jordan:\n\nSu contrato de la Unidad 4B se renueva el 1 de julio de 2026 a $1,850 por mes.\nFirme y devuelva el anexo adjunto antes del 15 de junio.\n\nLa oficina de alquileres",
    corruptText:
      "Declaración de trabajo\n\nNo se pudo maquetar el documento, así que este es el texto que el servidor extrajo al subirlo.",
  },
  true,
  true,
);

/** Fixtures live in .storybook/public/file-viewer/. */
const fixture = (name: string): string => `file-viewer/${name}`;

/**
 * A URL that fails like a deleted file or a dropped connection. A path that
 * doesn't exist would not: the deployed Storybook answers every unknown path
 * with its own page.
 */
const missingUrl = ((): string => {
  const url = URL.createObjectURL(new Blob(["gone"]));
  URL.revokeObjectURL(url);
  return url;
})();

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** What an app's endpoint returns for a legacy .doc: the text extracted at upload. */
const docFallback: FileViewerFallback = async () => {
  await wait(600);
  return { text: i18n.t("fileViewer:docText"), note: i18n.t("fileViewer:docNote") };
};

const corruptFallback: FileViewerFallback = async () => {
  await wait(600);
  return { text: i18n.t("fileViewer:corruptText") };
};

/**
 * A converted document whose HTML still carries a script, an event handler,
 * an iframe and a javascript: link. The viewer drops all four.
 */
const htmlFallback: FileViewerFallback = async () => {
  await wait(400);
  return {
    html:
      "<h1>Lease renewal letter</h1><p>Dear <strong>Jordan</strong>,</p>" +
      "<p>Your lease for <em>Unit 4B</em> renews on July 1, 2026.</p>" +
      "<script>alert('script ran')</script>" +
      '<img src="x" onerror="alert(\'onerror ran\')" alt="broken">' +
      '<iframe src="https://example.com"></iframe>' +
      "<table><thead><tr><th>Charge</th><th>Amount</th></tr></thead>" +
      "<tbody><tr><td>Rent</td><td>$1,850.00</td></tr><tr><td>Parking</td><td>$75.00</td></tr></tbody></table>" +
      "<ul><li>Sign the addendum</li><li>Return it by June 15</li></ul>" +
      '<p><a href="javascript:alert(1)">An unsafe link (plain text)</a> · <a href="https://example.com">A safe link</a></p>',
  };
};

/** The viewer with a ghost "Preview" button, as on Backstage's contract rows. */
function Example(props: Omit<FileViewerProps, "children">): React.ReactElement {
  const { t } = useTranslation("fileViewer");
  return (
    <FileViewer {...props}>
      <Button type="button" variant="ghost" aria-label={t("previewName", { name: props.filename })}>
        <FileTextIcon size={14} />
        {t("preview")} · {props.filename}
      </Button>
    </FileViewer>
  );
}

/**
 * A file in a dialog over the page. Wrap any trigger (a `Button` of any
 * variant), or control it with `open` / `onOpenChange`.
 *
 * PDFs frame the file URL, DOCX lays out pages with docx-preview, CSV renders
 * as a table (first 1,000 rows), and PNG/JPEG/GIF/BMP/WebP/AVIF and plain text
 * show as they are. Legacy `.doc`, a `.docx` that can't be laid out and other
 * types show what `loadFallback` returns, or offer a Download. docx-preview and
 * papaparse are loaded the first time a DOCX or a CSV opens.
 */
const meta: Meta<typeof Example> = {
  title: "Components/Overlays/FileViewer",
  component: Example,
  tags: ["autodocs"],
  render: (args) => <Example {...args} />,
};
export default meta;
type Story = StoryObj<typeof Example>;

// ── PDF ──

/** No `contentType`: the response's `Content-Type` picks the renderer. */
export const Pdf: Story = {
  args: { url: fixture("multipage.pdf"), filename: "Master Services Agreement – Acme 2026.pdf" },
};

/** The file is gone or the request fails: a message, never an error page in the frame. */
export const PdfMissing: Story = {
  args: { url: missingUrl, filename: "Deleted contract.pdf", contentType: "application/pdf" },
};

// ── Word ──

/** Symbol and Wingdings bullets show as real bullets; the javascript: link is plain text. */
export const Docx: Story = {
  args: {
    url: fixture("bullets-and-links.docx"),
    filename: "Statement of Work.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
};

/** A PDF renamed to .docx, with no fallback: a Download. */
export const DocxCorrupt: Story = {
  args: {
    url: fixture("corrupt.docx"),
    filename: "Statement of Work (corrupt).docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
};

/** The same file, with the app's fallback supplying the extracted text. */
export const DocxCorruptWithFallback: Story = {
  args: { ...DocxCorrupt.args, loadFallback: corruptFallback },
};

/** Word 97–2003 with the app's fallback: its text, and its note in a banner. */
export const DocWithFallback: Story = {
  args: {
    url: fixture("legacy.doc"),
    filename: "Lease renewal letter.doc",
    contentType: "application/msword",
    loadFallback: docFallback,
  },
};

/** Word 97–2003 and no fallback: a Download. */
export const DocWithoutFallback: Story = {
  args: { url: fixture("legacy.doc"), filename: "Lease renewal letter.doc", contentType: "application/msword" },
};

/** Fallback HTML is sanitised again: no script runs, no iframe or broken image shows. */
export const HtmlFallback: Story = {
  args: {
    url: fixture("legacy.doc"),
    filename: "Lease renewal letter (converted).doc",
    contentType: "application/msword",
    loadFallback: htmlFallback,
  },
};

// ── CSV ──

export const CsvComma: Story = {
  args: { url: fixture("comma.csv"), filename: "contractors.csv", contentType: "text/csv" },
};

export const CsvSemicolon: Story = {
  args: { url: fixture("semicolon.csv"), filename: "valores.csv", contentType: "text/csv" },
};

/** Saved by Excel on Windows (windows-1252), and labelled as an Excel file. */
export const CsvWindows1252: Story = {
  args: { url: fixture("cp1252.csv"), filename: "excel-export.csv", contentType: "application/vnd.ms-excel" },
};

/** Short rows padded, an extra cell under a blank header, a quoted newline in one cell. */
export const CsvRagged: Story = {
  args: { url: fixture("ragged.csv"), filename: "ragged.csv", contentType: "text/csv" },
};

/** 1,500 rows: the first 1,000 and a note. */
export const CsvLarge: Story = {
  args: { url: fixture("big.csv"), filename: "ledger-2026.csv", contentType: "text/csv" },
};

export const CsvHeaderOnly: Story = {
  args: { url: fixture("header-only.csv"), filename: "no-rows.csv", contentType: "text/csv" },
};

export const CsvEmpty: Story = {
  args: { url: fixture("empty.csv"), filename: "empty.csv", contentType: "text/csv" },
};

// ── Images, text, unsupported ──

export const Png: Story = {
  args: { url: fixture("photo.png"), filename: "unit-4b-kitchen.png", contentType: "image/png" },
};

/** Bytes that aren't the image they claim to be (HEIC labelled PNG). */
export const ImageBroken: Story = {
  args: { url: fixture("photo.heic"), filename: "unit-4b-kitchen.png", contentType: "image/png" },
};

/** HEIC isn't shown by most browsers, so it's unsupported. */
export const Heic: Story = {
  args: { url: fixture("photo.heic"), filename: "IMG_2041.heic", contentType: "image/heic" },
};

export const PlainText: Story = {
  args: { url: fixture("notes.txt"), filename: "kickoff-notes.txt", contentType: "text/plain" },
};

export const Unsupported: Story = {
  args: { url: fixture("archive.zip"), filename: "archive-2026.zip", contentType: "application/zip" },
};

// ── Usage ──

/** Opened from app state, with no trigger of its own. */
export const Controlled: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const { t } = useTranslation("fileViewer");
      const [open, setOpen] = useState(false);
      return (
        <div className="flex flex-col items-start gap-3">
          <Button variant="outline" onClick={() => setOpen(true)}>
            {t("openFromElsewhere")}
          </Button>
          <p className="text-xs text-text-muted">open = {String(open)}</p>
          <FileViewer
            url={fixture("multipage.pdf")}
            filename="Master Services Agreement – Acme 2026.pdf"
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      );
    }
    return <Demo />;
  },
};

/**
 * A trigger inside a clickable, transformed card (a draggable board card). The
 * dialog still covers the viewport, and no click in it reaches the card.
 */
export const InsideClickableCard: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const { t } = useTranslation("fileViewer");
      const [clicks, setClicks] = useState(0);
      return (
        <div className="max-w-sm space-y-2">
          <Card
            className="cursor-pointer space-y-3 p-4"
            style={{ transform: "translate(12px, 8px) rotate(-1deg)" }}
            onClick={() => setClicks((n) => n + 1)}
          >
            <p className="text-sm font-medium">{t("cardTitle")}</p>
            <FileViewer url={fixture("bullets-and-links.docx")} filename="Jordan Avery – Résumé.docx">
              <Button
                type="button"
                variant="outline"
                className="max-w-xs border-accent/40 bg-accent-muted text-accent-text hover:bg-accent/20 hover:text-accent-text"
              >
                <FileTextIcon size={14} />
                Jordan Avery – Résumé.docx
              </Button>
            </FileViewer>
          </Card>
          <p className="text-xs text-text-muted">{t("cardHint")}</p>
          <p className="text-xs text-text-muted">{t("cardClicks", { count: clicks })}</p>
        </div>
      );
    }
    return <Demo />;
  },
};
