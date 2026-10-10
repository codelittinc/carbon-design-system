import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Input } from "./input";
import { RadioGroup, RadioGroupItem } from "./radio-group";

/** RadioGroup picks exactly one of a few options, all visible. */
const meta: Meta<typeof RadioGroup> = {
  title: "Components/Forms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

const ANSWERS = [
  { value: "a", label: "A resident's ledger" },
  { value: "b", label: "A unit's make-ready board" },
  { value: "c", label: "A prospect's guest card" },
  { value: "d", label: "A vendor's invoice" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Where does a new lead first appear?</p>
        <RadioGroup aria-label="Answer" value={value} onChange={setValue} options={ANSWERS} />
        <p className="mt-4 text-sm text-text-muted">Chosen: {value || "(none)"}</p>
      </div>
    );
  },
};

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState("yes");
    return (
      <RadioGroup
        aria-label="Agree"
        orientation="horizontal"
        value={value}
        onChange={setValue}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
    );
  },
};

/** Items as children: choosing which typed answer is the correct one. */
export const WithCustomRows: Story = {
  render: () => {
    const [correct, setCorrect] = useState("0");
    const [answers, setAnswers] = useState(["", "", "", ""]);
    return (
      <RadioGroup aria-label="Correct answer" value={correct} onChange={setCorrect} className="gap-2">
        {answers.map((answer, i) => (
          <div key={i} className="flex items-center gap-2">
            <RadioGroupItem value={String(i)} aria-label={`Answer ${i + 1} is correct`} />
            <Input
              value={answer}
              placeholder={`Answer ${i + 1}`}
              onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
            />
          </div>
        ))}
      </RadioGroup>
    );
  },
};

export const DisabledOption: Story = {
  args: {
    value: "a",
    onChange: () => {},
    options: [ANSWERS[0], { ...ANSWERS[1], disabled: true }],
  },
};
