import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import Toast from "../common/Toast";

type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning";

type ToastData = {
  id: number;
  type: ToastType;
  title: string;
  message: string;
};

type ToastContextType = {
  showToast: (toast: {
    type: ToastType;
    title: string;
    message: string;
  }) => void;

  hideToast: (id: number) => void;
};

const ToastContext = createContext<
  ToastContextType | undefined
>(undefined);


export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [toasts, setToasts] =
    useState<ToastData[]>([]);


  const showToast = useCallback(
    ({
      type,
      title,
      message,
    }: {
      type: ToastType;
      title: string;
      message: string;
    }) => {

      const id =
        Date.now() +
        Math.random();

      setToasts((current) => [
        ...current,
        {
          id,
          type,
          title,
          message,
        },
      ]);


      // Automatically remove after 4 seconds
      setTimeout(() => {

        setToasts((current) =>
          current.filter(
            (toast) =>
              toast.id !== id
          )
        );

      }, 4000);

    },
    []
  );


  const hideToast = useCallback(
    (id: number) => {

      setToasts((current) =>
        current.filter(
          (toast) =>
            toast.id !== id
        )
      );

    },
    []
  );


  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
      }}
    >

      {children}


      {/* Toast container */}

      <div
        className="
          fixed
          right-5
          top-5
          z-[9999]
          flex
          w-[360px]
          max-w-[calc(100vw-2rem)]
          flex-col
          gap-3
        "
      >

        {toasts.map((toast) => (

          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() =>
              hideToast(toast.id)
            }
          />

        ))}

      </div>

    </ToastContext.Provider>
  );
}


export function useToast() {

  const context =
    useContext(ToastContext);


  if (!context) {

    throw new Error(
      "useToast must be used inside ToastProvider"
    );

  }


  return context;
}