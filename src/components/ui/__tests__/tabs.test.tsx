import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

function renderTabs(defaultValue = "one") {
  return render(
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("exposes tablist, tab and tabpanel roles", () => {
    renderTabs();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("shows the default tab's panel", () => {
    renderTabs();
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });

  it("switches the visible panel when another tab is clicked", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByText("Second panel")).toBeInTheDocument();
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("respects defaultValue for the initially active tab", () => {
    renderTabs("two");
    expect(screen.getByText("Second panel")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  it("forwards className to the list", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList className="custom-list">
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveClass("custom-list");
  });
});
