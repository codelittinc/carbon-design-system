import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="#handbook">Company handbook</BreadcrumbLink><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbLink href="#engineering">Engineering</BreadcrumbLink><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbPage>Repository security</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>,
};

export const Narrow: Story = {
  render: () => <div className="w-64 max-w-full">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="#handbook">Company handbook</BreadcrumbLink><BreadcrumbSeparator /></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbLink href="#guidelines">Engineering tool guidelines</BreadcrumbLink><BreadcrumbSeparator /></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbPage>GitHub — Repository Security and Access</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>,
};

/** `asChild` preserves your router link's client-side navigation. */
export const RouterLink: Story = {
  render: () => <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink asChild><a href="#handbook" data-router-link="">Company handbook</a></BreadcrumbLink><BreadcrumbSeparator>/</BreadcrumbSeparator></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbPage>Unfiled</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>,
};
