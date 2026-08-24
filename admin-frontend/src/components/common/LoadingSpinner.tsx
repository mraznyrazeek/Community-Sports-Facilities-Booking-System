interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({
  text = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

        <p className="text-sm font-medium text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}