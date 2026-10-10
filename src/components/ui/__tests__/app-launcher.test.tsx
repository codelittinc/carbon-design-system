import { render, screen, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
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
  // The modal panel sets `pointer-events: none` on the page, which user-event
  // otherwise refuses to click through for an outside click.
  const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
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

  it("closes on a click outside and returns focus to the trigger", async () => {
    const { user } = await openLauncher();
    await user.pointer({ keys: "[MouseLeft]", target: document.body });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Carbon apps" })).toHaveFocus();
  });

  it("keeps Tab inside the panel, cycling from the last link to the first", async () => {
    const user = userEvent.setup();
    render(<AppLauncher sections={SECTIONS} moreHref="https://gatekeeper.example.com/me" />);
    screen.getByRole("button", { name: "Carbon apps" }).focus();
    await user.keyboard("{Enter}");

    await user.tab();
    await user.tab();
    expect(screen.getByRole("link", { name: /^All your tools/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: /^Backbone/ })).toHaveFocus();
  });

  it("closes when a link is chosen", async () => {
    const { user, panel } = await openLauncher();
    await user.click(within(panel).getByRole("link", { name: /^Gatekeeper/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sorts each section's apps by name", async () => {
    const { panel } = await openLauncher();
    const group = within(panel).getByRole("group", { name: "CarbonOS" });
    const links = within(group).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://backbone.example.com",
      "https://gatekeeper.example.com",
    ]);
  });

  it("marks the current app, without a link", async () => {
    const { panel } = await openLauncher();
    const item = within(panel).getByText("Player Scoreboard").closest("li")!;
    expect(within(item).queryByRole("link")).not.toBeInTheDocument();
    expect(within(item).getByText("Current")).toBeVisible();
    expect(within(item).getByText("Player Scoreboard").parentElement).toHaveAttribute("aria-current", "true");
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

  it("draws no tiles unless asked", async () => {
    const { panel } = await openLauncher();
    expect(panel.querySelector("[aria-hidden='true'].rounded-md")).toBeNull();
  });

  it("with icons, puts a tile before every app: its logo, or its initials", async () => {
    const { panel } = await openLauncher({
      icons: true,
      sections: [
        {
          heading: "Tools",
          apps: [
            { name: "Slack", href: "https://slack.com", iconSrc: "https://example.com/slack.png" },
            { name: "Yardi", href: null },
            { name: "Gatekeeper", href: null, current: true },
          ],
        },
      ],
    });
    const slack = within(panel).getByRole("link", { name: /^Slack/ });
    expect(slack.querySelector("img")).toHaveAttribute("src", "https://example.com/slack.png");
    const yardi = within(panel).getByText("Yardi").closest("li")!;
    expect(yardi).toHaveTextContent(/^YA/);
    const current = within(panel).getByText("Gatekeeper").closest("li")!;
    expect(current).toHaveTextContent(/^GA/);
  });
});
