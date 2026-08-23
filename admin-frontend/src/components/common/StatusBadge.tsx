interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let className =
    "bg-slate-100 text-slate-600 ring-slate-200";

  if (
    [
      "active",
      "confirmed",
      "completed",
      "resolved",
      "approved",
    ].includes(normalized)
  ) {
    className =
      "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (
    [
      "pending",
      "processing",
      "waiting",
    ].includes(normalized)
  ) {
    className =
      "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (
    [
      "cancelled",
      "canceled",
      "inactive",
      "rejected",
      "blocked",
    ].includes(normalized)
  ) {
    className =
      "bg-red-50 text-red-700 ring-red-200";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}