import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning";

type ToastProps = {
  type: ToastType;
  title: string;
  message: string;
  onClose: () => void;
};


export default function Toast({
  type,
  title,
  message,
  onClose,
}: ToastProps) {

  const getStyles = () => {

    switch (type) {

      case "success":
        return {
          wrapper:
            "border-emerald-200 bg-white",

          iconWrapper:
            "bg-emerald-50 text-emerald-600",

          title:
            "text-emerald-700",

          icon: (
            <CheckCircle2
              size={20}
            />
          ),
        };


      case "error":
        return {
          wrapper:
            "border-red-200 bg-white",

          iconWrapper:
            "bg-red-50 text-red-600",

          title:
            "text-red-700",

          icon: (
            <XCircle
              size={20}
            />
          ),
        };


      case "warning":
        return {
          wrapper:
            "border-amber-200 bg-white",

          iconWrapper:
            "bg-amber-50 text-amber-600",

          title:
            "text-amber-700",

          icon: (
            <AlertTriangle
              size={20}
            />
          ),
        };


      case "info":
      default:
        return {
          wrapper:
            "border-blue-200 bg-white",

          iconWrapper:
            "bg-blue-50 text-blue-600",

          title:
            "text-blue-700",

          icon: (
            <Info
              size={20}
            />
          ),
        };

    }

  };


  const styles = getStyles();


  return (

    <div
      className={`
        pointer-events-auto
        flex
        w-full
        items-start
        gap-3
        rounded-2xl
        border
        ${styles.wrapper}
        px-4
        py-3.5
        shadow-lg
        shadow-slate-900/10
        animate-[toast-in_0.25s_ease-out]
      `}
    >

      {/* Icon */}

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${styles.iconWrapper}
        `}
      >
        {styles.icon}
      </div>


      {/* Content */}

      <div className="min-w-0 flex-1">

        <p
          className={`
            text-sm
            font-semibold
            ${styles.title}
          `}
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            text-xs
            leading-5
            text-slate-500
          "
        >
          {message}
        </p>

      </div>


      {/* Close */}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          text-slate-400
          transition
          hover:bg-slate-100
          hover:text-slate-700
        "
      >

        <X size={16} />

      </button>

    </div>

  );
}