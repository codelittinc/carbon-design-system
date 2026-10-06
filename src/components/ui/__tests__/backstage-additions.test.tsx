import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { forwardRef, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogTitle } from "../alert-dialog";
import { Button } from "../button";
import { CardHeader } from "../card";
import { ChartLegend } from "../chart";
import { ConfirmProvider, useConfirm, type ConfirmOptions } from "../confirm";
import { DataTable, type ColumnDef } from "../data-table";
import { EmptyState } from "../empty-state";
import * as Icons from "../icons";
import { PageHeader } from "../page-header";
import { SearchSelect } from "../search-select";
import { StatCard } from "../stat-card";
import { TextLink } from "../text-link";
import { linkTextClass } from "@/lib/ui-classes";

/** The solid destructive fill, with its fallback for a theme without the token. */
const SOLID_DESTRUCTIVE = "bg-[var(--color-error-solid,#dc2626)]";

describe("CardHeader", () => {
  it("renders the title as an h2 by default, with description and actions", () => {
    render(<CardHeader title="Contracts" description="12 active" actions={<Button>Add</Button>} />);
    expect(screen.getByRole("heading", { level: 2, name: "Contracts" })).toBeInTheDocument();
    expect(screen.getByText("12 active")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("takes a heading level", () => {
    render(<CardHeader as="h3" title="Hours" />);
    expect(screen.getByRole("heading", { level: 3, name: "Hours" })).toBeInTheDocument();
  });
});

describe("TextLink", () => {
  it("is an anchor with the link style", () => {
    render(<TextLink href="/contracts">Contracts</TextLink>);
    const link = screen.getByRole("link", { name: "Contracts" });
    expect(link).toHaveAttribute("href", "/contracts");
    expect(link).toHaveClass("text-accent-text");
  });

  it("opens an external link in a new tab, and says so", () => {
    render(
      <TextLink href="https://example.com" external>
        Docs
      </TextLink>,
    );
    const link = screen.getByRole("link", { name: /^Docs ?\(opens in a new tab\)$/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps a caller's rel when external, adding noopener noreferrer", () => {
    render(
      <TextLink href="https://example.com" external rel="nofollow noopener">
        Docs
      </TextLink>,
    );
    const rel = screen.getByRole("link", { name: /Docs/ }).getAttribute("rel")!.split(" ");
    expect(rel.sort()).toEqual(["nofollow", "noopener", "noreferrer"]);
  });

  it("shares one link style with Button variant=\"link\"", () => {
    render(
      <>
        <TextLink href="/a">Inline</TextLink>
        <Button variant="link">As button</Button>
      </>,
    );
    const classes = linkTextClass.split(" ");
    expect(classes.length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Inline" })).toHaveClass(...classes);
    expect(screen.getByRole("button", { name: "As button" })).toHaveClass(...classes);
  });

  it("styles a router link with asChild", () => {
    const RouterLink = forwardRef<HTMLAnchorElement, { href: string; children?: ReactNode; className?: string }>(
      (props, ref) => <a ref={ref} data-router="" {...props} />,
    );
    render(
      <TextLink asChild>
        <RouterLink href="/x">Open</RouterLink>
      </TextLink>,
    );
    const link = screen.getByRole("link", { name: "Open" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveClass("text-accent-text");
  });
});

describe("icons", () => {
  it("re-exports the curated set with an Icon suffix", () => {
    for (const name of ["ChevronDownIcon", "SearchIcon", "XIcon", "TrashIcon", "FileIcon", "CopyIcon", "ExternalLinkIcon"]) {
      expect(Icons[name as keyof typeof Icons]).toBeTruthy();
    }
    const { container } = render(<Icons.CheckIcon size={12} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Button tone", () => {
  it("turns ghost and outline buttons red, token-based", () => {
    render(
      <>
        <Button variant="ghost" tone="destructive">
          Remove
        </Button>
        <Button variant="outline" tone="destructive">
          Delete
        </Button>
      </>,
    );
    const ghost = screen.getByRole("button", { name: "Remove" });
    expect(ghost).toHaveClass("text-error-text", "hover:bg-error-soft");
    expect(ghost).not.toHaveClass("text-text-secondary");
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("border-error-border", "text-error-text");
  });

  it("is the solid destructive button on the default variant, fallbacks included", () => {
    render(<Button tone="destructive">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(SOLID_DESTRUCTIVE);
  });
});

describe("SearchSelect additions", () => {
  it("shows selectedOption when the value is not among the options", () => {
    render(
      <SearchSelect
        ariaLabel="Customer"
        value="c9"
        onChange={() => {}}
        onSearch={() => {}}
        options={[]}
        selectedOption={{ value: "c9", label: "Acme Corp" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Customer" })).toHaveTextContent("Acme Corp");
  });

  it("ignores a selectedOption for a different value", () => {
    render(
      <SearchSelect
        ariaLabel="Customer"
        value={null}
        onChange={() => {}}
        onSearch={() => {}}
        options={[]}
        selectedOption={{ value: "c9", label: "Acme Corp" }}
        placeholder="Pick one"
      />,
    );
    expect(screen.getByRole("button", { name: "Customer" })).toHaveTextContent("Pick one");
  });

  it("skips a disabled option with the arrows and will not pick it", () => {
    const onChange = vi.fn();
    render(
      <SearchSelect
        ariaLabel="Fruit"
        value={null}
        onChange={onChange}
        onSearch={() => {}}
        options={[
          { value: "a", label: "Apple", disabled: true },
          { value: "b", label: "Banana" },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Fruit" });
    act(() => {
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
    });
    const apple = screen.getByRole("option", { name: "Apple" });
    expect(apple).toHaveAttribute("aria-disabled", "true");
    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Banana" }).id);
    fireEvent.click(apple);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("disables the trigger", () => {
    render(<SearchSelect ariaLabel="Fruit" value={null} onChange={() => {}} onSearch={() => {}} options={[]} disabled />);
    expect(screen.getByRole("button", { name: "Fruit" })).toBeDisabled();
  });

  it("closes when disabled while open, and stays closed when enabled again", () => {
    const props = {
      ariaLabel: "Fruit",
      value: null,
      onChange: () => {},
      onSearch: () => {},
      options: [{ value: "a", label: "Apple" }],
    };
    const { rerender } = render(<SearchSelect {...props} />);
    const trigger = screen.getByRole("button", { name: "Fruit" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    rerender(<SearchSelect {...props} disabled />);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    rerender(<SearchSelect {...props} />);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("AlertDialogAction tone", () => {
  it("draws the destructive button for tone=\"destructive\", as Button does", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Delete?</AlertDialogTitle>
          <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
          <AlertDialogAction>Keep</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(SOLID_DESTRUCTIVE);
    expect(screen.getByRole("button", { name: "Keep" })).toHaveClass("bg-accent");
    expect(screen.getByRole("button", { name: "Keep" })).not.toHaveClass(SOLID_DESTRUCTIVE);
  });
});

describe("useConfirm", () => {
  function Asker({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (answer: boolean) => void }) {
    const confirm = useConfirm();
    return <Button onClick={async () => onAnswer(await confirm(options))}>Delete row</Button>;
  }

  async function ask(options: ConfirmOptions) {
    const onAnswer = vi.fn();
    render(
      <ConfirmProvider>
        <Asker options={options} onAnswer={onAnswer} />
      </ConfirmProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete row" }));
    });
    return onAnswer;
  }

  it("resolves true for the action", async () => {
    const onAnswer = await ask({ title: "Delete this row?", confirmLabel: "Delete", destructive: true });
    const dialog = screen.getByRole("alertdialog", { name: "Delete this row?" });
    const action = within(dialog).getByRole("button", { name: "Delete" });
    expect(action).toHaveClass(SOLID_DESTRUCTIVE);
    await act(async () => {
      fireEvent.click(action);
    });
    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("resolves false for Cancel", async () => {
    const onAnswer = await ask({ title: "Leave?", description: "Your edits are lost." });
    expect(screen.getByText("Your edits are lost.")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    });
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  describe("returns focus to what was focused when confirm() was called", () => {
    async function askFromFocused() {
      const onAnswer = vi.fn();
      render(
        <ConfirmProvider>
          <Asker options={{ title: "Delete this row?", confirmLabel: "Delete" }} onAnswer={onAnswer} />
        </ConfirmProvider>,
      );
      const opener = screen.getByRole("button", { name: "Delete row" });
      opener.focus();
      await act(async () => {
        fireEvent.click(opener);
      });
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(document.activeElement).not.toBe(opener);
      return { opener, onAnswer };
    }

    /** Radix moves focus on close after a tick, once the dialog has unmounted. */
    const afterClose = () => act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("after the action", async () => {
      const { opener, onAnswer } = await askFromFocused();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      });
      expect(onAnswer).toHaveBeenCalledWith(true);
      await afterClose();
      expect(document.activeElement).toBe(opener);
    });

    it("after Cancel", async () => {
      const { opener, onAnswer } = await askFromFocused();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      });
      expect(onAnswer).toHaveBeenCalledWith(false);
      await afterClose();
      expect(document.activeElement).toBe(opener);
    });

    it("after Escape", async () => {
      const { opener, onAnswer } = await askFromFocused();
      await act(async () => {
        fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
      });
      expect(onAnswer).toHaveBeenCalledWith(false);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      await afterClose();
      expect(document.activeElement).toBe(opener);
    });
  });

  it("answers a pending confirm \"no\" when the provider unmounts", async () => {
    const onAnswer = vi.fn();
    const { unmount } = render(
      <ConfirmProvider>
        <Asker options={{ title: "Delete?" }} onAnswer={onAnswer} />
      </ConfirmProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete row" }));
    });
    unmount();
    await act(async () => {});
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it("throws without a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Asker options={{ title: "x" }} onAnswer={() => {}} />)).toThrow(/ConfirmProvider/);
    spy.mockRestore();
  });
});

describe("StatCard additions", () => {
  it("takes an action, children and a value class", () => {
    render(
      <StatCard label="Needs review" value={4} valueClassName="text-error-text" action={<Button>View</Button>}>
        <p>2 overdue</p>
      </StatCard>,
    );
    expect(screen.getByText("4")).toHaveClass("text-error-text");
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getByText("2 overdue")).toBeInTheDocument();
  });
});

describe("DataTable footer", () => {
  interface Row {
    name: string;
    amount: number;
  }
  const rows: Row[] = [
    { name: "A", amount: 10 },
    { name: "B", amount: 32 },
  ];

  it("renders a footer row when a column defines a footer", () => {
    const columns: ColumnDef<Row, unknown>[] = [
      { accessorKey: "name", header: "Name", footer: "Total" },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { align: "right" },
        footer: ({ table }) => table.getFilteredRowModel().rows.reduce((sum, r) => sum + r.original.amount, 0),
      },
    ];
    const { container } = render(<DataTable columns={columns} data={rows} />);
    const footer = container.querySelector("tfoot")!;
    const cells = within(footer).getAllByRole("cell");
    expect(cells.map((c) => c.textContent)).toEqual(["Total", "42"]);
    expect(cells[1]).toHaveClass("text-right");
  });

  it("has no footer when no column defines one", () => {
    const { container } = render(
      <DataTable columns={[{ accessorKey: "name", header: "Name" }] as ColumnDef<Row, unknown>[]} data={rows} />,
    );
    expect(container.querySelector("tfoot")).toBeNull();
  });
});

describe("PageHeader back", () => {
  it("links back above the h1", () => {
    render(<PageHeader title="Contract 12" back={{ href: "/contracts", label: "Contracts" }} />);
    expect(screen.getByRole("link", { name: "Contracts" })).toHaveAttribute("href", "/contracts");
    expect(screen.getByRole("heading", { level: 1, name: "Contract 12" })).toBeInTheDocument();
  });

  it("renders the app's link component", () => {
    const AppLink = forwardRef<HTMLAnchorElement, { href: string; children?: ReactNode }>((props, ref) => (
      <a ref={ref} data-app-link="" {...props} />
    ));
    render(<PageHeader title="Contract 12" back={{ href: "/contracts", label: "Contracts", as: AppLink }} />);
    expect(screen.getByRole("link", { name: "Contracts" })).toHaveAttribute("data-app-link");
  });
});

describe("EmptyState as", () => {
  it("keeps h3 by default and takes another level", () => {
    const { rerender } = render(<EmptyState title="Nothing here" />);
    expect(screen.getByRole("heading", { level: 3, name: "Nothing here" })).toBeInTheDocument();
    rerender(<EmptyState as="h1" title="Access denied" />);
    expect(screen.getByRole("heading", { level: 1, name: "Access denied" })).toBeInTheDocument();
  });
});

describe("ChartLegend value", () => {
  it("shows each entry's value", () => {
    render(
      <ChartLegend
        items={[
          { label: "Google", color: "var(--color-chart-1)", value: "60.0%" },
          { label: "Zillow", color: "var(--color-chart-2)", value: "40.0%" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Google60.0%");
    expect(items[1]).toHaveTextContent("Zillow40.0%");
  });
});

