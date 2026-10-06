import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Progress } from "./progress";

i18n.addResourceBundle(
  "en",
  "progress",
  {
    notStarted: "Not started",
    applicationReceived: "Application received",
    screeningInProgress: "Screening in progress",
    leaseDrafted: "Lease drafted",
    moveInComplete: "Move-in complete",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "progress",
  {
    notStarted: "Sin iniciar",
    applicationReceived: "Solicitud recibida",
    screeningInProgress: "Verificación en curso",
    leaseDrafted: "Contrato redactado",
    moveInComplete: "Mudanza completada",
  },
  true,
  true,
);

/**
 * Progress is a Radix progress bar. It renders a determinate fill based on the
 * `value` prop (0–100). There is no indeterminate mode — `value` is required to
 * show any fill (defaults to 0). Used for things like rent-collection rate or
 * lease-renewal completion.
 */
const meta: Meta<typeof Progress> = {
  title: "Components/Data Display/Progress",
  component: Progress,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={60} />
    </div>
  ),
};

const steps = [
  { value: 0, key: "notStarted" },
  { value: 25, key: "applicationReceived" },
  { value: 50, key: "screeningInProgress" },
  { value: 75, key: "leaseDrafted" },
  { value: 100, key: "moveInComplete" },
] as const;

export const Values: Story = {
  render: () => {
    const { t } = useTranslation("progress");
    return (
      <div className="flex w-80 flex-col gap-5">
        {steps.map(({ value, key }) => (
          <div key={value} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{t(key)}</span>
              <span className="tabular-nums">{value}%</span>
            </div>
            <Progress value={value} />
          </div>
        ))}
      </div>
    );
  },
};

/** `tone` colors the fill when the amount is the news: complete, over, short. */
export const Tones: Story = {
  render: () => (
    <div className="w-72 space-y-3">
      {(["accent", "success", "warning", "error", "info"] as const).map((tone) => (
        <Progress key={tone} value={60} tone={tone} aria-label={tone} />
      ))}
    </div>
  ),
};
