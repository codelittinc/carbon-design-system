import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { sanitizeRichText } from "@/lib/rich-text";
import { Alert } from "./alert";
import { Button } from "./button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { FormField } from "./form-field";
import { Input } from "./input";
import { RichTextEditor, type RichTextEditorHandle, type RichTextLinkTarget } from "./rich-text-editor";

i18n.addResourceBundle(
  "en",
  "richTextEditor",
  {
    placeholder: "Add a note…",
    noteValue:
      "<p>Access is granted by the <strong>regional manager</strong>, not the site team.</p><ul><li>Ask in #it-help first</li><li>Include the property code</li></ul>",
    notesLabel: "Notes",
    notesHint: "Anything worth knowing that the other fields do not cover.",
    lockedLabel: "Notes (locked)",
    lockedValue: "<p>Locked while the period is closed.</p>",
    extendedValue:
      "<h1>Onboarding</h1><p>Read this <strong>before</strong> the first day. <s>Old step</s> removed.</p><h2>Access</h2><blockquote><p>Ask the regional manager, not the site team.</p></blockquote><h3>Command</h3><p>Run <code>make setup</code>, or:</p><pre><code>git clone repo\ncd repo &amp;&amp; make setup</code></pre><ul><li>Laptop</li><li>Badge</li></ul><p>See the <a href=\"https://example.com/handbook\">handbook</a>.</p>",
    bodyLabel: "Message",
    subjectLabel: "Subject",
    signature: "Signature",
    signatureTitle: "Adds your signature",
    signupName: "sign-up link",
    signupHelp: "Links to each person's own sign-up page when the message is sent.",
    surveyName: "survey link",
    surveyHelp: "Links to the feedback survey.",
    uploadFailed: "The image couldn't be uploaded. Try a smaller file.",
    insertInto: "Insert into the field you were last in:",
    dialogTitle: "Edit the message",
    dialogDescription: "Escape in a link editor closes only the link editor.",
    storedHeading: "What gets stored",
    storedNote:
      "The panel above is the editor's raw output. The panel below is what sanitizeRichText keeps — the only thing that may be rendered back.",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "richTextEditor",
  {
    placeholder: "Añadir una nota…",
    noteValue:
      "<p>El acceso lo concede el <strong>gerente regional</strong>, no el equipo del sitio.</p><ul><li>Pregunte primero en #it-help</li><li>Incluya el código de la propiedad</li></ul>",
    notesLabel: "Notas",
    notesHint: "Cualquier cosa que valga la pena saber y que los otros campos no cubran.",
    lockedLabel: "Notas (bloqueado)",
    lockedValue: "<p>Bloqueado mientras el período está cerrado.</p>",
    extendedValue:
      "<h1>Incorporación</h1><p>Lea esto <strong>antes</strong> del primer día. <s>Paso antiguo</s> eliminado.</p><h2>Acceso</h2><blockquote><p>Pregunte al gerente regional, no al equipo del sitio.</p></blockquote><h3>Comando</h3><p>Ejecute <code>make setup</code>, o:</p><pre><code>git clone repo\ncd repo &amp;&amp; make setup</code></pre><ul><li>Portátil</li><li>Credencial</li></ul><p>Vea el <a href=\"https://example.com/handbook\">manual</a>.</p>",
    bodyLabel: "Mensaje",
    subjectLabel: "Asunto",
    signature: "Firma",
    signatureTitle: "Añade su firma",
    signupName: "enlace de registro",
    signupHelp: "Enlaza a la página de registro de cada persona cuando se envía el mensaje.",
    surveyName: "enlace a la encuesta",
    surveyHelp: "Enlaza a la encuesta de opinión.",
    uploadFailed: "No se pudo subir la imagen. Pruebe con un archivo más pequeño.",
    insertInto: "Insertar en el último campo que usó:",
    dialogTitle: "Editar el mensaje",
    dialogDescription: "Escape en un editor de enlaces cierra solo el editor de enlaces.",
    storedHeading: "Lo que se guarda",
    storedNote:
      "El panel de arriba es la salida sin procesar del editor. El de abajo es lo que conserva sanitizeRichText — lo único que puede volver a renderizarse.",
  },
  true,
  true,
);

/**
 * RichTextEditor is the WYSIWYG field for a paragraph or two of prose — a note
 * on a record, an instruction somebody has to follow. Bold, italic, two kinds of
 * list, and links; anything longer or more structured than that wants a
 * document editor, not this.
 *
 * It emits HTML through `onChange` and deliberately does **not** sanitize it. A
 * client is not a trust boundary: whatever this produces arrives at a server as
 * a string in a form post, and that string can say anything. Pass stored values
 * through `sanitizeRichText` from
 * `@codelittinc/carbon-design-system/utils` — on the way in *and* on the way out,
 * before `dangerouslySetInnerHTML`. The **Sanitized output** story shows the
 * difference between the two.
 *
 * Do not sanitize inside `onChange`. Feeding back a different string than the
 * editor emitted makes the sync effect treat it as an external change, which
 * rewrites the DOM and drops the caret to the start of the field on every
 * keystroke.
 */
const meta: Meta<typeof RichTextEditor> = {
  title: "Components/Forms/RichTextEditor",
  component: RichTextEditor,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem]">
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder={t("placeholder")}
          ariaLabel={t("notesLabel")}
        />
      </div>
    );
  },
};

export const WithValue: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState(t("noteValue"));
    return (
      <div className="w-[32rem]">
        <RichTextEditor value={value} onChange={setValue} ariaLabel={t("notesLabel")} />
      </div>
    );
  },
};

/** In a form, under a `FormField` label like any other control. */
export const InAFormField: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem]">
        <FormField label={t("notesLabel")} htmlFor="notes" hint={t("notesHint")}>
          <RichTextEditor
            id="notes"
            value={value}
            onChange={setValue}
            placeholder={t("placeholder")}
            className="min-h-40"
          />
        </FormField>
      </div>
    );
  },
};

export const Disabled: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    return (
      <div className="w-[32rem]">
        <FormField label={t("lockedLabel")}>
          <RichTextEditor
            value={t("lockedValue")}
            onChange={() => {}}
            disabled
            ariaLabel={t("lockedLabel")}
          />
        </FormField>
      </div>
    );
  },
};

export const Invalid: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem]">
        <FormField label={t("notesLabel")} htmlFor="notes-invalid" error="Notes are required">
          <RichTextEditor
            id="notes-invalid"
            value={value}
            onChange={setValue}
            invalid
            placeholder={t("placeholder")}
          />
        </FormField>
      </div>
    );
  },
};

/**
 * The editor's raw output beside what `sanitizeRichText` keeps of it.
 *
 * Type in the field and the two panels stay identical, because the toolbar only
 * produces tags the sanitizer allows — nothing typed through this UI is lost on
 * save. Paste something from a web page, or set the value to markup with a
 * `style` attribute or an `onclick`, and the second panel is what survives.
 */
export const SanitizedOutput: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState(t("noteValue"));
    return (
      <div className="flex w-[36rem] flex-col gap-3">
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder={t("placeholder")}
          ariaLabel={t("notesLabel")}
        />
        <p className="text-xs text-text-muted">{t("storedNote")}</p>
        <div className="grid gap-2">
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-2 text-[11px] leading-relaxed text-text-secondary">
            {value || "(empty)"}
          </pre>
          <pre className="overflow-x-auto rounded-md border border-accent-muted bg-surface p-2 text-[11px] leading-relaxed text-accent-text">
            {sanitizeRichText(value) || "(empty)"}
          </pre>
        </div>
      </div>
    );
  },
};

/** A mock upload: about 1.5s, then an object URL for the picked file. No network. */
const fakeUpload = (file: File) =>
  new Promise<string | null>((resolve) => setTimeout(() => resolve(URL.createObjectURL(file)), 1500));

function useTargets(): RichTextLinkTarget[] {
  const { t } = useTranslation("richTextEditor");
  return [
    { href: "{{signup_link}}", name: t("signupName"), description: t("signupHelp") },
    { href: "{{survey_link}}", name: t("surveyName"), description: t("surveyHelp") },
  ];
}

/**
 * `formatting="extended"`: headings 1–3, strikethrough, quotes, inline code
 * and code blocks, with Markdown-style shortcuts (`## `, `> `, three backticks).
 * Prefilled with every element, to check the type scale in both themes.
 */
export const ExtendedFormatting: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState(t("extendedValue"));
    return (
      <div className="w-[36rem]">
        <RichTextEditor value={value} onChange={setValue} formatting="extended" ariaLabel={t("notesLabel")} />
      </div>
    );
  },
};

/**
 * `linkPanel`: a popover to add, edit and remove a link, with optional text to
 * show and an inline error. What is typed is normalised: `example.com` gains
 * `https://`, `ana@example.com` becomes a mailto link.
 */
export const FullLinkPanel: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState(t("noteValue"));
    return (
      <div className="w-[32rem]">
        <RichTextEditor value={value} onChange={setValue} formatting="extended" linkPanel ariaLabel={t("notesLabel")} />
      </div>
    );
  },
};

/**
 * `linkPanel={{ targets }}`: hrefs that are not URLs, filled in later by the
 * app — here two made-up placeholders. Each gets a quick-fill button and help
 * text, worded by the app. Sanitize this markup with the app's own allow-list:
 * `sanitizeRichText` drops non-URL hrefs.
 */
export const ExtraLinkTargets: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    const targets = useTargets();
    return (
      <div className="w-[32rem]">
        <RichTextEditor
          value={value}
          onChange={setValue}
          formatting="extended"
          linkPanel={{ targets }}
          placeholder={t("placeholder")}
          ariaLabel={t("bodyLabel")}
        />
      </div>
    );
  },
};

/** `uploadImage`: the Insert image button, an uploading state, and the image inserted at the caret. */
export const ImageUpload: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem]">
        <RichTextEditor value={value} onChange={setValue} uploadImage={fakeUpload} placeholder={t("placeholder")} ariaLabel={t("notesLabel")} />
      </div>
    );
  },
};

/** An upload that resolves `null` inserts nothing; the app shows its own error. */
export const ImageUploadFails: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    const [failed, setFailed] = useState(false);
    return (
      <div className="flex w-[32rem] flex-col gap-2">
        <RichTextEditor
          value={value}
          onChange={setValue}
          uploadImage={async () => {
            setFailed(true);
            return null;
          }}
          ariaLabel={t("notesLabel")}
        />
        {failed && <Alert variant="error">{t("uploadFailed")}</Alert>}
      </div>
    );
  },
};

/** `insertActions`: a toolbar button per snippet, inserted at the caret. */
export const InsertActions: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem]">
        <RichTextEditor
          value={value}
          onChange={setValue}
          insertActions={[
            { label: t("signature"), title: t("signatureTitle"), html: "<p>— Ana, People team</p>" },
            { label: "{{first_name}}", html: "{{first_name}}" },
          ]}
          ariaLabel={t("bodyLabel")}
        />
      </div>
    );
  },
};

/**
 * The `ref` handle: `insert(html)` writes at the editor's last caret position
 * from outside it — here a row of buttons shared with a subject `Input`.
 */
export const InsertFromOutside: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [subject, setSubject] = useState("");
    const [value, setValue] = useState("");
    const editorRef = useRef<RichTextEditorHandle>(null);
    const subjectRef = useRef<HTMLInputElement>(null);
    const lastField = useRef<"subject" | "body">("body");
    const insert = (token: string) => {
      if (lastField.current === "body") return editorRef.current?.insert(token);
      setSubject((s) => s + token);
      subjectRef.current?.focus();
    };
    return (
      <div className="flex w-[32rem] flex-col gap-3">
        <FormField label={t("subjectLabel")} htmlFor="subject">
          <Input id="subject" ref={subjectRef} value={subject} onChange={(e) => setSubject(e.target.value)} onFocus={() => (lastField.current = "subject")} />
        </FormField>
        <div onFocusCapture={() => (lastField.current = "body")}>
          <RichTextEditor ref={editorRef} value={value} onChange={setValue} ariaLabel={t("bodyLabel")} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          {t("insertInto")}
          {["{{first_name}}", "{{position}}"].map((token) => (
            <Button key={token} variant="outline" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(token)}>
              {token}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};

/** Every opt-in at once, in a narrow container, to show the toolbar wrapping by group. */
export const AllCapabilities: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState(t("extendedValue"));
    const targets = useTargets();
    return (
      <div className="w-80">
        <RichTextEditor
          value={value}
          onChange={setValue}
          formatting="extended"
          uploadImage={fakeUpload}
          linkPanel={{ targets }}
          insertActions={[{ label: t("signature"), title: t("signatureTitle"), html: "<p>— Ana</p>" }]}
          ariaLabel={t("notesLabel")}
        />
      </div>
    );
  },
};

/** Escape in either link UI — the default row or the panel — closes it and leaves the dialog open. */
export const InADialog: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [open, setOpen] = useState(true);
    const [a, setA] = useState(t("noteValue"));
    const [b, setB] = useState(t("noteValue"));
    return (
      <>
        <Button onClick={() => setOpen(true)}>{t("dialogTitle")}</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialogTitle")}</DialogTitle>
              <DialogDescription>{t("dialogDescription")}</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-3">
              <RichTextEditor value={a} onChange={setA} ariaLabel={t("notesLabel")} />
              <RichTextEditor value={b} onChange={setB} formatting="extended" linkPanel ariaLabel={t("bodyLabel")} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** The extended editor's raw output beside `sanitizeRichText(value, { formatting: "extended" })`: identical, nothing lost. */
export const SanitizedOutputExtended: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const { t } = useTranslation("richTextEditor");
    const [value, setValue] = useState(t("extendedValue"));
    return (
      <div className="flex w-[36rem] flex-col gap-3">
        <RichTextEditor value={value} onChange={setValue} formatting="extended" ariaLabel={t("notesLabel")} />
        <p className="text-xs text-text-muted">{t("storedNote")}</p>
        <div className="grid gap-2">
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-2 text-[11px] leading-relaxed text-text-secondary">
            {value || "(empty)"}
          </pre>
          <pre className="overflow-x-auto rounded-md border border-accent-muted bg-surface p-2 text-[11px] leading-relaxed text-accent-text">
            {sanitizeRichText(value, { formatting: "extended" }) || "(empty)"}
          </pre>
        </div>
      </div>
    );
  },
};
