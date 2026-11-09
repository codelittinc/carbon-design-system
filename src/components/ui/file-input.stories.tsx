import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { FileInput } from "./file-input";
import { FormField } from "./form-field";

i18n.addResourceBundle(
  "en",
  "fileInput",
  {
    label: "Rent roll export",
    hint: "A CSV from Yardi, as it downloads.",
    error: "This file can't be read. Upload the CSV as Yardi gives it.",
    chooseFile: "Choose file",
    noFile: "No file chosen",
    remove: "Remove file",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "fileInput",
  {
    label: "Exportación del rent roll",
    hint: "Un CSV de Yardi, tal como se descarga.",
    error: "No se puede leer este archivo. Súbelo como lo entrega Yardi.",
    chooseFile: "Elegir archivo",
    noFile: "Ningún archivo elegido",
    remove: "Quitar archivo",
  },
  true,
  true,
);

/**
 * FileInput chooses one file — an export to import, a document to attach. It
 * is controlled: the app holds the `File`. Drop a file on the row, or press
 * the button (or Enter on the focused field) to pick one.
 */
const meta: Meta<typeof FileInput> = {
  title: "Components/Forms/FileInput",
  component: FileInput,
  tags: ["autodocs"],
};
export default meta;

function Example({ initial = null, disabled = false, invalid = false }: { initial?: File | null; disabled?: boolean; invalid?: boolean }) {
  const { t } = useTranslation("fileInput");
  const [file, setFile] = useState<File | null>(initial);
  return (
    <div className="w-[28rem]">
      <FormField label={t("label")} htmlFor="story-file" hint={invalid ? undefined : t("hint")} error={invalid ? t("error") : undefined}>
        <FileInput
          id="story-file"
          accept=".csv,text/csv"
          value={file}
          onChange={setFile}
          disabled={disabled}
          buttonLabel={t("chooseFile")}
          emptyLabel={t("noFile")}
          removeLabel={t("remove")}
        />
      </FormField>
    </div>
  );
}

const sample = () => new File(["a".repeat(904_569)], "rent-roll-november.csv", { type: "text/csv" });

export const Default: StoryObj<typeof FileInput> = {
  render: () => <Example />,
};

export const WithFile: StoryObj<typeof FileInput> = {
  render: () => <Example initial={sample()} />,
};

export const Invalid: StoryObj<typeof FileInput> = {
  render: () => <Example initial={sample()} invalid />,
};

export const Disabled: StoryObj<typeof FileInput> = {
  render: () => <Example initial={sample()} disabled />,
};
