import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./pagination";

/** Pagination moves through a list split into pages. */
const meta: Meta<typeof Pagination> = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <div className="w-[36rem]">
        <Pagination page={page} totalPages={12} onPageChange={setPage} totalItems={115} pageSize={10} />
      </div>
    );
  },
};
