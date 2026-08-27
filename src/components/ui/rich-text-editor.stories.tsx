import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { sanitizeRichText } from "@/lib/rich-text";
import { FormField } from "./form-field";
import { RichTextEditor } from "./rich-text-editor";

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
