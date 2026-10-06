import type { ElementType, ReactElement, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { TextLink } from "./text-link";

export interface PageHeaderBack {
  href: string;
  /** Where it goes: "Contracts", "All profiles". */
  label: string;
  /**
   * The link element to render, for client-side routing — Next.js's `Link`,
   * say. Defaults to a plain `<a>`.
   */
  as?: ElementType<{ href: string; children?: ReactNode }>;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  /** A link back to the page above this one, shown over the title. */
  back?: PageHeaderBack;
  className?: string;
}

/**
 * The page's title (its `h1`), with an optional description, actions on the
 * right, and a back link above it. For a section's heading inside the page,
 * use `CardHeader`.
 */
export function PageHeader({ title, description, actions, back, className }: PageHeaderProps): ReactElement {
  const BackLink = back?.as ?? "a";
  return (
    <div className={cn("mb-6 flex items-start justify-between", className)}>
      <div>
        {back && (
          <TextLink
            asChild
            className="mb-2 flex w-fit items-center text-sm font-normal text-text-muted hover:text-text-primary"
          >
            <BackLink href={back.href}>
              <ArrowLeft size={14} aria-hidden="true" />
              {back.label}
            </BackLink>
          </TextLink>
        )}
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
