import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { EventCalendar } from "./event-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { SegmentedChip } from "./segmented-chip";
import { getCategoricalSegments } from "@/lib/categorical-colors";

/**
 * EventCalendar shows a month of days with items in them. Here each item is a
 * person off that day, drawn as a SegmentedChip colored by their projects,
 * with a hover popover (`openOnHover`) that a click pins.
 */
const meta: Meta<typeof EventCalendar> = {
  title: "Components/Data Display/EventCalendar",
  component: EventCalendar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof EventCalendar>;

interface Person {
  id: number;
  name: string;
  projectIds: number[];
}

const PEOPLE: Person[] = [
  { id: 1, name: "Jane D.", projectIds: [1] },
  { id: 2, name: "John S.", projectIds: [2, 3] },
  { id: 3, name: "Alex M.", projectIds: [] },
  { id: 4, name: "Sam K.", projectIds: [1, 2, 3, 4, 5] },
  { id: 5, name: "Ana P.", projectIds: [4] },
  { id: 6, name: "Luis R.", projectIds: [5, 6] },
];

function itemsFor(month: string): Map<string, Person[]> {
  const day = (d: number) => `${month}-${String(d).padStart(2, "0")}`;
  return new Map([
    [day(3), PEOPLE.slice(0, 2)],
    [day(8), [PEOPLE[2]]],
    [day(14), [PEOPLE[3]]],
    [day(21), PEOPLE.slice(0, 6)],
  ]);
}

function PersonChip({ person }: { person: Person }) {
  return (
    <Popover openOnHover>
      <PopoverTrigger asChild>
        <SegmentedChip
          segments={getCategoricalSegments(person.projectIds)}
          label={person.name}
          aria-label={`${person.name}, ${person.projectIds.length} projects`}
        />
      </PopoverTrigger>
      <PopoverContent aria-label={person.name} className="w-56 p-3 text-sm">
        <p className="font-semibold text-text-primary">{person.name}</p>
        <p className="mt-0.5 text-xs text-text-muted">Vacation · {person.projectIds.length} projects</p>
      </PopoverContent>
    </Popover>
  );
}

function Demo({ loading = false }: { loading?: boolean }) {
  const [month, setMonth] = useState("2026-07");
  return (
    <EventCalendar<Person>
      month={month}
      onMonthChange={setMonth}
      itemsByDate={itemsFor(month)}
      renderItem={(person) => <PersonChip person={person} />}
      itemKey={(person) => person.id}
      loading={loading}
      overflowAriaLabel={(_, n) => `Show ${n} more ${n === 1 ? "person" : "people"}`}
      overflowPopoverTitle={(_, n) => `${n} people off`}
    />
  );
}

export const Default: Story = { render: () => <Demo /> };

export const Loading: Story = { render: () => <Demo loading /> };
