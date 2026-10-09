import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppLauncher, type AppLauncherSection } from "../app-launcher";

const SECTIONS: AppLauncherSection[] = [
  {
    heading: "CarbonOS",
    apps: [
      { name: "Player Scoreboard", href: "https://scoreboard.example.com", current: true },
      { name: "Gatekeeper", href: "https://gatekeeper.example.com" },
      { name: "Backbone", href: "https://backbone.example.com" },
    ],
  },
  { heading: "Tools", apps: [{ name: "Yardi", href: null }] },
];

async function openLauncher(props: Partial<React.ComponentProps<typeof AppLauncher>> = {}) {
  const user = userEvent.setup();
  render(<AppLauncher sections={SECTIONS} {...props} />);
  await user.click(screen.getByRole("button", { name: "Carbon apps" }));
  return { user, panel: screen.getByRole("dialog", { name: "Carbon apps" }) };
}

describe("AppLauncher", () => {
  it("names the trigger, with a matching tooltip", () => {
    render(<AppLauncher sections={SECTIONS} label="Apps" />);
    const trigger = screen.getByRole("button", { name: "Apps" });
    expect(trigger).toHaveAttribute("title", "Apps");
    expect(trigger.querySelector("svg")).toHaveClass("lucide-grip");
  });

  it("opens from the keyboard on the first link, and Escape returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<AppLauncher sections={SECTIONS} />);
    const trigger = screen.getByRole("button", { name: "Carbon apps" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("link", { name: /^Backbone/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: /^Gatekeeper/ })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("opens each link in a new tab, and says so to a screen reader", async () => {
    const { panel } = await openLauncher();
    const link = within(panel).getByRole("link", { name: /^Gatekeeper ?\(opens in a new tab\)$/ });
    expect(link).toHaveAttribute("href", "https://gatekeeper.example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(within(link).getByText("(opens in a new tab)")).toHaveClass("sr-only");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("takes the new-tab text as a prop", async () => {
    const { panel } = await openLauncher({ newTabLabel: " (abre en una pestaña nueva)" });
    expect(within(panel).getByRole("link", { name: /^Gatekeeper ?\(abre en una pestaña nueva\)$/ })).toBeInTheDocument();
  });

  it("closes on a click outside", async () => {
    const { user } = await openLauncher();
    await user.click(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when a link is chosen", async () => {
    const { user, panel } = await openLauncher();
    await user.click(within(panel).getByRole("link", { name: /^Gatekeeper/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sorts each section's apps by name", async () => {
    const { panel } = await openLauncher();
    const group = within(panel).getByRole("group", { name: "CarbonOS" });
    const names = within(group)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(names).toEqual([
      "Backbone (opens in a new tab)",
      "Gatekeeper (opens in a new tab)",
      "Player ScoreboardCurrent",
    ]);
  });

  it("marks the current app, without a link", async () => {
    const { panel } = await openLauncher();
    const item = within(panel).getByText("Player Scoreboard").closest("li")!;
    expect(within(item).queryByRole("link")).not.toBeInTheDocument();
    expect(within(item).getByText("Current")).toBeInTheDocument();
    expect(item.firstElementChild).toHaveClass("bg-accent-muted", "text-accent-text");
  });

  it("shows an app with no href as text, with no link", async () => {
    const { panel } = await openLauncher();
    const item = within(panel).getByText("Yardi").closest("li")!;
    expect(item.querySelector("a")).toBeNull();
    expect(within(item).getByText("Link unavailable")).toBeInTheDocument();
  });

  it("leaves out empty sections", async () => {
    const { panel } = await openLauncher({
      sections: [...SECTIONS, { heading: "Reports", apps: [] }],
    });
    expect(within(panel).getAllByRole("group")).toHaveLength(2);
    expect(within(panel).queryByText("Reports")).not.toBeInTheDocument();
  });

  it("shows the empty state when every section is empty, and the list takes focus", async () => {
    const { panel } = await openLauncher({ sections: [{ heading: "CarbonOS", apps: [] }] });
    expect(within(panel).getByRole("heading", { name: "No apps to show yet" })).toBeInTheDocument();
    expect(within(panel).queryByRole("group")).not.toBeInTheDocument();
    const list = within(panel).getByText(/once IT gives you access/).closest("[tabindex]");
    expect(list).toHaveAttribute("tabindex", "0");
    expect(list).toHaveFocus();
  });

  it("shows the notice and the footer link", async () => {
    const { panel } = await openLauncher({
      notice: "App links couldn't load.",
      moreHref: "https://gatekeeper.example.com/me",
    });
    expect(within(panel).getByText("App links couldn't load.")).toBeInTheDocument();
    const more = within(panel).getByRole("link", { name: /^All your tools ?\(opens in a new tab\)$/ });
    expect(more).toHaveAttribute("href", "https://gatekeeper.example.com/me");
    expect(more).toHaveAttribute("rel", "noopener noreferrer");
  });
});
