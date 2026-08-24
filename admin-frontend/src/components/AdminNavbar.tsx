import { Bell } from "lucide-react";
import { useState } from "react";

export default function AdminNavbar() {
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  return (
    <div className="fixed right-5 top-4 z-[100]">

      {/* Floating Notification Button */}
      <button
        type="button"
        aria-label="Notifications"
        onClick={() =>
          setNotificationsOpen((value) => !value)
        }
        className="
          relative
          flex h-11 w-11
          items-center justify-center
          rounded-xl
          border border-slate-200
          bg-white
          text-slate-500
          shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5
          hover:border-slate-300
          hover:bg-slate-50
          hover:text-slate-900
          hover:shadow-md
        "
      >
        <Bell
          size={20}
          strokeWidth={1.8}
        />

        {/* Red notification dot */}
        <span
          className="
            absolute
            right-1.5
            top-1.5
            h-2.5
            w-2.5
            rounded-full
            bg-red-500
            ring-2
            ring-white
          "
        />
      </button>


      {/* Notification Dropdown */}
      {notificationsOpen && (
        <div
          className="
            absolute
            right-0
            top-14
            w-[320px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-xl
            shadow-slate-900/10
          "
        >

          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-4
              py-4
            "
          >

            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Notifications
              </h3>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-400
                "
              >
                Recent system activity
              </p>
            </div>

            <span
              className="
                rounded-full
                bg-red-50
                px-2
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-red-600
              "
            >
              New
            </span>

          </div>


          {/* Notification */}
          <div
            className="
              border-b
              border-slate-100
              px-4
              py-4
            "
          >

            <div className="flex gap-3">

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                "
              >
                <Bell size={17} />
              </div>

              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-900
                  "
                >
                  System notifications
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  New booking, member and system
                  activity will appear here.
                </p>

              </div>

            </div>

          </div>


          {/* Footer */}
          <div
            className="
              flex
              justify-end
              bg-slate-50/70
              px-4
              py-3
            "
          >

            <button
              type="button"
              onClick={() =>
                setNotificationsOpen(false)
              }
              className="
                text-xs
                font-semibold
                text-blue-600
                transition
                hover:text-blue-700
              "
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}