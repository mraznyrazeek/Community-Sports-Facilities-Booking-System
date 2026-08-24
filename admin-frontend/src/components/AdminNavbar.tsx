import {
  Bell,
  CalendarCheck,
  ChevronRight,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getBookings,
  getMembers,
  getInquiries,
  type Booking,
  type Member,
  type Inquiry,
} from "../services/api";


type NotificationType =
  | "member"
  | "booking"
  | "inquiry";


type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
};


const READ_NOTIFICATIONS_KEY =
  "sportshub_read_notifications";


export default function AdminNavbar() {

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [readNotificationIds, setReadNotificationIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     LOAD READ NOTIFICATIONS
  ===================================================== */

  useEffect(() => {

    try {

      const stored =
        localStorage.getItem(
          READ_NOTIFICATIONS_KEY
        );

      if (stored) {

        const parsed =
          JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setReadNotificationIds(parsed);
        }

      }

    } catch (error) {

      console.error(
        "Unable to load notification state:",
        error
      );

    }

  }, []);


  /* =====================================================
     FETCH NOTIFICATIONS
  ===================================================== */

  const loadNotifications =
    async (
      isInitialLoad = false
    ) => {

      try {

        const [
          bookings,
          members,
          inquiries,
        ] = await Promise.all([
          getBookings(),
          getMembers(),
          getInquiries(),
        ]);


        /* ===============================================
           BOOKINGS
        =============================================== */

        const bookingNotifications: Notification[] =
          (bookings || [])
            .filter(
              (booking: Booking) =>
                booking.createdAt
            )
            .map(
              (booking: Booking) => ({

                id:
                  `booking-${booking.bookingId}`,

                type:
                  "booking",

                title:
                  "New booking",

                description:
                  booking.facility
                    ?.facilityName ||
                  "Facility booking",

                date:
                  booking.createdAt,

              })
            );


        /* ===============================================
           MEMBERS
        =============================================== */

        const memberNotifications: Notification[] =
          (members || [])
            .filter(
              (member: Member) =>
                member.createdAt
            )
            .map(
              (member: Member) => ({

                id:
                  `member-${member.memberId}`,

                type:
                  "member",

                title:
                  "New member joined",

                description:
                  member.name ||
                  "New community member",

                date:
                  member.createdAt,

              })
            );


        /* ===============================================
           INQUIRIES
        =============================================== */

        const inquiryNotifications: Notification[] =
          (inquiries || [])
            .filter(
              (inquiry: Inquiry) =>
                inquiry.createdAt
            )
            .map(
              (inquiry: Inquiry) => ({

                id:
                  `inquiry-${inquiry.inquiryId}`,

                type:
                  "inquiry",

                title:
                  "New inquiry",

                description:
                  inquiry.subject ||
                  "New member inquiry",

                date:
                  inquiry.createdAt,

              })
            );


        /* ===============================================
           COMBINE
        =============================================== */

        const allNotifications = [
          ...bookingNotifications,
          ...memberNotifications,
          ...inquiryNotifications,
        ];


        /* ===============================================
           SORT NEWEST FIRST
        =============================================== */

        allNotifications.sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );


        /* ===============================================
           ONLY LATEST 5
        =============================================== */

        const latestFive =
          allNotifications.slice(0, 5);


        /*
         * On the very first load, don't mark all
         * existing records as new.
         *
         * This prevents the admin from opening the
         * dashboard and suddenly seeing 5 old
         * notifications as "new".
         */

        if (isInitialLoad) {

          setReadNotificationIds(
            (currentReadIds) => {

              const existingIds =
                latestFive.map(
                  (notification) =>
                    notification.id
                );

              const merged = Array.from(
                new Set([
                  ...currentReadIds,
                  ...existingIds,
                ])
              );

              localStorage.setItem(
                READ_NOTIFICATIONS_KEY,
                JSON.stringify(merged)
              );

              return merged;

            }
          );

        }


        setNotifications(
          latestFive
        );


      } catch (error) {

        console.error(
          "Notification loading error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


  /* =====================================================
     INITIAL LOAD + REAL-TIME POLLING
  ===================================================== */

  useEffect(() => {

    /*
     * Initial notification load
     */
    loadNotifications(true);


    /*
     * Check for new activity every 10 seconds
     */
    const interval =
      window.setInterval(() => {

        loadNotifications(false);

      }, 10000);


    return () => {

      window.clearInterval(
        interval
      );

    };

  }, []);


  /* =====================================================
     UNREAD COUNT
  ===================================================== */

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !readNotificationIds.includes(
          notification.id
        )
    );


  const hasUnread =
    unreadNotifications.length > 0;


  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const markAllAsRead = () => {

    const allIds =
      notifications.map(
        (notification) =>
          notification.id
      );


    setReadNotificationIds(
      (currentIds) => {

        const updated =
          Array.from(
            new Set([
              ...currentIds,
              ...allIds,
            ])
          );


        localStorage.setItem(
          READ_NOTIFICATIONS_KEY,
          JSON.stringify(updated)
        );


        return updated;

      }
    );

  };


  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const getRelativeTime =
    (date: string) => {

      if (!date) {
        return "";
      }


      const difference =
        Date.now() -
        new Date(date).getTime();


      if (difference < 0) {
        return "Just now";
      }


      const seconds =
        Math.floor(
          difference / 1000
        );


      const minutes =
        Math.floor(
          seconds / 60
        );


      const hours =
        Math.floor(
          minutes / 60
        );


      const days =
        Math.floor(
          hours / 24
        );


      if (seconds < 60) {
        return "Just now";
      }


      if (minutes < 60) {

        return `${minutes} ${
          minutes === 1
            ? "minute"
            : "minutes"
        } ago`;

      }


      if (hours < 24) {

        return `${hours} ${
          hours === 1
            ? "hour"
            : "hours"
        } ago`;

      }


      if (days < 7) {

        return `${days} ${
          days === 1
            ? "day"
            : "days"
        } ago`;

      }


      return new Date(
        date
      ).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
        }
      );

    };


  /* =====================================================
     NOTIFICATION ICON
  ===================================================== */

  const getNotificationIcon =
    (type: NotificationType) => {

      switch (type) {

        case "member":

          return (
            <UserPlus
              size={17}
              strokeWidth={1.8}
            />
          );


        case "booking":

          return (
            <CalendarCheck
              size={17}
              strokeWidth={1.8}
            />
          );


        case "inquiry":

          return (
            <MessageCircle
              size={17}
              strokeWidth={1.8}
            />
          );

      }

    };


  /* =====================================================
     NOTIFICATION COLORS
  ===================================================== */

  const getNotificationStyle =
    (type: NotificationType) => {

      switch (type) {

        case "member":

          return {
            wrapper:
              "bg-emerald-50 text-emerald-600",
          };


        case "booking":

          return {
            wrapper:
              "bg-blue-50 text-blue-600",
          };


        case "inquiry":

          return {
            wrapper:
              "bg-purple-50 text-purple-600",
          };

      }

    };


  return (

    <div
      className="
        fixed
        right-5
        top-4
        z-[100]
      "
    >

      {/* =================================================
          FLOATING BELL
      ================================================= */}

      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={
          notificationsOpen
        }
        onClick={() =>
          setNotificationsOpen(
            (value) => !value
          )
        }
        className={`
          group
          relative
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-200/80
          bg-white/95
          text-slate-500
          shadow-[0_4px_14px_rgba(15,23,42,0.08)]
          backdrop-blur-sm
          transition-all
          duration-200

          hover:-translate-y-0.5
          hover:border-blue-200
          hover:bg-blue-50/70
          hover:text-blue-600
          hover:shadow-[0_8px_22px_rgba(37,99,235,0.14)]

          active:translate-y-0
          active:scale-95

          ${
            notificationsOpen
              ? "border-blue-200 bg-blue-50 text-blue-600"
              : ""
          }
        `}
      >

        <Bell
          size={20}
          strokeWidth={1.8}
          className="
            transition-transform
            duration-200
            group-hover:rotate-[-8deg]
          "
        />


        {/* =================================================
            RED NEW INDICATOR
        ================================================= */}

        {hasUnread && (

          <span
            className="
              absolute
              right-1
              top-1
              flex
              h-3
              w-3
              items-center
              justify-center
              rounded-full
              bg-red-500
              ring-2
              ring-white
            "
          >

            <span
              className="
                h-1
                w-1
                rounded-full
                bg-white
              "
            />

          </span>

        )}

      </button>


      {/* =================================================
          NOTIFICATION PANEL
      ================================================= */}

      {notificationsOpen && (

        <div
          className="
            absolute
            right-0
            top-[54px]
            w-[350px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_20px_45px_rgba(15,23,42,0.14)]
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

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

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Notifications
                </h3>


                {unreadNotifications.length > 0 && (

                  <span
                    className="
                      rounded-full
                      bg-red-50
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      text-red-600
                    "
                  >
                    {unreadNotifications.length} new
                  </span>

                )}

              </div>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Latest activity from your platform
              </p>

            </div>


            {/* Mark all as read */}

            {hasUnread && (

              <button
                type="button"
                onClick={markAllAsRead}
                className="
                  text-[11px]
                  font-semibold
                  text-blue-600
                  transition
                  hover:text-blue-700
                "
              >
                Mark all as read
              </button>

            )}

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {loading ? (

            <div
              className="
                flex
                items-center
                justify-center
                px-4
                py-10
              "
            >

              <div
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-slate-200
                  border-t-blue-600
                "
              />

            </div>

          ) : notifications.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div
              className="
                px-5
                py-10
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-50
                  text-slate-400
                "
              >
                <Bell
                  size={18}
                />
              </div>


              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                No notifications
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                New activity will appear here.
              </p>

            </div>

          ) : (

            <div>

              {notifications.map(
                (notification) => {

                  const isUnread =
                    !readNotificationIds.includes(
                      notification.id
                    );


                  const styles =
                    getNotificationStyle(
                      notification.type
                    );


                  return (

                    <div
                      key={
                        notification.id
                      }
                      className={`
                        group
                        flex
                        gap-3
                        border-b
                        border-slate-100
                        px-4
                        py-3.5
                        transition

                        ${
                          isUnread
                            ? "bg-blue-50/35"
                            : "bg-white"
                        }

                        hover:bg-slate-50
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
                          ${styles.wrapper}
                        `}
                      >

                        {getNotificationIcon(
                          notification.type
                        )}

                      </div>


                      {/* Content */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >

                          <p
                            className={`
                              text-sm
                              ${
                                isUnread
                                  ? "font-semibold"
                                  : "font-medium"
                              }
                              text-slate-900
                            `}
                          >
                            {notification.title}
                          </p>


                          {/* New dot */}

                          {isUnread && (

                            <span
                              className="
                                mt-1
                                h-2
                                w-2
                                shrink-0
                                rounded-full
                                bg-red-500
                              "
                            />

                          )}

                        </div>


                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-slate-500
                          "
                        >
                          {notification.description}
                        </p>


                        <div
                          className="
                            mt-1.5
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <span
                            className="
                              text-[10px]
                              font-medium
                              text-slate-400
                            "
                          >
                            {getRelativeTime(
                              notification.date
                            )}
                          </span>


                          {isUnread && (

                            <span
                              className="
                                rounded-full
                                bg-red-50
                                px-1.5
                                py-0.5
                                text-[9px]
                                font-semibold
                                text-red-500
                              "
                            >
                              NEW
                            </span>

                          )}

                        </div>

                      </div>


                      <ChevronRight
                        size={15}
                        className="
                          mt-2
                          shrink-0
                          text-slate-300
                          transition
                          group-hover:translate-x-0.5
                          group-hover:text-slate-400
                        "
                      />

                    </div>

                  );

                }
              )}

            </div>

          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          {notifications.length > 0 && (

            <div
              className="
                flex
                items-center
                justify-between
                bg-slate-50/60
                px-4
                py-3
              "
            >

              <span
                className="
                  text-[10px]
                  font-medium
                  text-slate-400
                "
              >
                Showing latest{" "}
                {Math.min(
                  notifications.length,
                  5
                )}{" "}
                events
              </span>


              <span
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-medium
                  text-slate-400
                "
              >

                <span
                  className="
                    h-1.5
                    w-1.5
                    animate-pulse
                    rounded-full
                    bg-emerald-500
                  "
                />

                Live

              </span>

            </div>

          )}

        </div>

      )}

    </div>

  );
}