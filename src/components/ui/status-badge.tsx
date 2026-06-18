import { Badge } from "./badge";

type StatusVariant = "success" | "warning" | "error" | "info" | "default" | "accent";

const STATUS_MAP: Record<string, StatusVariant> = {
  OPEN: "success",
  ACTIVE: "success",
  APPROVED: "success",
  POSTED: "success",
  CURRENT: "success",
  PAID: "success",
  COMPLETED: "success",
  CLOSED: "error",
  VOIDED: "error",
  CANCELLED: "error",
  REJECTED: "error",
  PAST_RESIDENT: "error",
  SOFT_CLOSED: "warning",
  PENDING: "warning",
  PENDING_APPROVAL: "warning",
  DRAFT: "default",
  NOTICE: "warning",
  PARTIALLY_PAID: "info",
  PARTIALLY_FULFILLED: "info",
  IN_PROGRESS: "info",
  APPLICANT: "info",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_MAP[status] ?? "default";
  const label = status.replace(/_/g, " ");

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
