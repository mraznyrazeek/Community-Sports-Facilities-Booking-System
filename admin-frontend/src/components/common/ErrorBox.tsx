import { AlertCircle, X } from "lucide-react";

interface ErrorBoxProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorBox({
  message,
  onClose,
}: ErrorBoxProps) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
      <AlertCircle className="mt-0.5 shrink-0" size={18} />

      <p className="flex-1 leading-6">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}