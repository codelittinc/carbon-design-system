import { render, screen, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppLauncher, type AppLauncherSection } from "../app-launcher";
import { clearAppLogoCache } from "../app-logos";

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
    expect(link.querySelector("svg")).toBeNull();
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

  it("merges every section into one list sorted by name, with no headings", async () => {
    const { panel } = await openLauncher({
      icons: false,
      sections: [...SECTIONS, { heading: "Reports", apps: [{ name: "Asana", href: "https://asana.com" }] }],
    });
    const names = within(panel)
      .getAllByRole("listitem")
      .map((item) => item.textContent?.replace(/\(opens in a new tab\)|\(Current\)|Link unavailable/g, "").trim());
    expect(names).toEqual(["Asana", "Backbone", "Gatekeeper", "Player Scoreboard", "Yardi"]);
    expect(within(panel).queryByRole("group")).not.toBeInTheDocument();
    for (const heading of ["CarbonOS", "Tools", "Reports"]) {
      expect(within(panel).queryByText(heading)).not.toBeInTheDocument();
    }
  });

  it("highlights the current app, without a link or a visible label", async () => {
    const { panel } = await openLauncher();
    const item = within(panel).getByText("Player Scoreboard").closest("li")!;
    expect(within(item).queryByRole("link")).not.toBeInTheDocument();
    const row = item.querySelector("[aria-current='true']")!;
    expect(row).toHaveClass("bg-accent-muted", "font-medium");
    expect(row).toHaveTextContent("Player Scoreboard (Current)");
    expect(within(item).getByText("(Current)", { exact: false })).toHaveClass("sr-only", "select-none");
    // The only "Current" in the row is that hidden suffix: no visible badge.
    expect(within(item).queryByText("Current")).toBeNull();
  });

  it("shows an app with no href as text, with no link", async () => {
    const { panel } = await openLauncher();
    const item = within(panel).getByText("Yardi").closest("li")!;
    expect(item.querySelector("a")).toBeNull();
    expect(within(item).getByText("Link unavailable")).toBeInTheDocument();
  });

  it("shows the empty state when every section is empty, and the list takes focus", async () => {
    const { panel } = await openLauncher({ sections: [{ heading: "CarbonOS", apps: [] }] });
    expect(within(panel).getByRole("heading", { name: "No apps to show yet" })).toBeInTheDocument();
    expect(within(panel).queryByRole("list")).not.toBeInTheDocument();
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

  it("puts a tile before every app by default", async () => {
    const { panel } = await openLauncher();
    expect(panel.querySelectorAll("li [aria-hidden='true'].rounded-md")).toHaveLength(4);
  });

  it("draws no tiles when icons is false", async () => {
    const { panel } = await openLauncher({ icons: false });
    expect(panel.querySelector("[aria-hidden='true'].rounded-md")).toBeNull();
  });

  it("puts a tile before every app: its logo, or its initials", async () => {
    const { panel } = await openLauncher({
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

  describe("logos", () => {
    const KEYED: AppLauncherSection[] = [
      {
        heading: "Tools",
        apps: [
          { key: "atlas", name: "Atlas", href: "https://atlas.example.com" },
          { key: "yardi", name: "Yardi", href: "https://yardi.example.com" },
          { key: "slack", name: "Slack", href: "https://slack.com", iconSrc: "https://example.com/slack.png" },
        ],
      },
    ];
    const getToken = vi.fn<() => Promise<string | null>>(async () => "session-token");
    const logos = { baseUrl: "https://gatekeeper.example.com/", getToken };
    const fetchMock = vi.fn();
    // The panel, the token and the fetch are all async; CI machines are slower than ours.
    const eventually = { timeout: 5000 };

    beforeEach(() => {
      clearAppLogoCache();
      getToken.mockClear();
      fetchMock.mockReset();
      fetchMock.mockImplementation(async (url: string) =>
        url.includes("/atlas/")
          ? new Response(new Blob(["png"], { type: "image/png" }), { status: 200, headers: { "content-type": "image/png" } })
          : new Response(JSON.stringify({ code: "no_logo" }), { status: 404, headers: { "content-type": "application/json" } }),
      );
      vi.stubGlobal("fetch", fetchMock);
      URL.createObjectURL = vi.fn(() => "blob:atlas-logo");
    });
    afterEach(() => vi.unstubAllGlobals());

    it("asks nothing until the panel opens", () => {
      render(<AppLauncher sections={KEYED} logos={logos} />);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("fetches each keyed app's logo with the person's token, and draws it; no logo keeps the initials", async () => {
      const { panel } = await openLauncher({ sections: KEYED, logos });
      await vi.waitFor(() => expect(within(panel).getByRole("link", { name: /^Atlas/ }).querySelector("img")).toHaveAttribute("src", "blob:atlas-logo"), eventually);

      expect(fetchMock).toHaveBeenCalledWith("https://gatekeeper.example.com/api/me/apps/atlas/logo?inline=1", {
        headers: { Authorization: "Bearer session-token" },
        credentials: "omit",
      });
      expect(fetchMock).toHaveBeenCalledWith("https://gatekeeper.example.com/api/me/apps/yardi/logo?inline=1", expect.anything());
      expect(within(panel).getByRole("link", { name: /^Yardi/ }).querySelector("img")).toBeNull();
      expect(within(panel).getByRole("link", { name: /^Yardi/ })).toHaveTextContent(/^YA/);
    });

    it("leaves an app that already has an iconSrc alone", async () => {
      const { panel } = await openLauncher({ sections: KEYED, logos });
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), eventually);
      expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("/slack/"), expect.anything());
      expect(within(panel).getByRole("link", { name: /^Slack/ }).querySelector("img")).toHaveAttribute("src", "https://example.com/slack.png");
    });

    it("keeps the initials when nobody is signed in or the request fails", async () => {
      getToken.mockResolvedValueOnce(null);
      fetchMock.mockRejectedValue(new Error("offline"));
      const { panel } = await openLauncher({ sections: KEYED, logos });
      await vi.waitFor(() => expect(getToken).toHaveBeenCalled(), eventually);
      expect(panel.querySelector("img[src^='blob:']")).toBeNull();
      expect(within(panel).getByRole("link", { name: /^Atlas/ })).toHaveTextContent(/^AT/);
    });

    it("does not ask again within the cache window when reopened", async () => {
      const { user } = await openLauncher({ sections: KEYED, logos });
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), eventually);
      await user.keyboard("{Escape}");
      await user.click(screen.getByRole("button", { name: "Carbon apps" }));
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
