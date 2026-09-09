import {
    Bell,
    CalendarDays,
    Check,
    ChevronDown,
    LogOut,
    Menu,
    Settings,
    Star,
    Trophy,
    User,
    X,
} from "lucide-react";

import {
    Link,
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import {
   getCurrentMember,
getMyNotifications,
getUnreadNotificationCount,
syncReviewNotifications,
logout,
markAllNotificationsAsRead,
markNotificationAsRead,
} from "../../services/api";


// ============================================================
// NOTIFICATION TYPE
// ============================================================

type NotificationItem = {
    notificationId: number;
    memberId: number;
    title: string;
    message: string;
    type: string;
    referenceType?: string;
    referenceId?: number;
    isRead: boolean;
    createdAt: string;
};


export default function CustomerNavbar() {
    const navigate = useNavigate();
    const member = getCurrentMember();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    // ============================================================
    // NOTIFICATION STATE
    // ============================================================

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationMenuOpen, setNotificationMenuOpen] =
        useState(false);
    const [notificationsLoading, setNotificationsLoading] =
        useState(false);


    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================

    const loadNotifications = async () => {
    try {
        // --------------------------------------------------------
        // First check whether a completed booking now needs
        // a review notification.
        // --------------------------------------------------------

        await syncReviewNotifications();

        // --------------------------------------------------------
        // Then load notifications and unread count.
        // --------------------------------------------------------

        const [notificationData, unreadData] =
            await Promise.all([
                getMyNotifications(),
                getUnreadNotificationCount(),
            ]);

        const notificationList =
            Array.isArray(notificationData)
                ? notificationData
                : notificationData?.data ||
                  notificationData?.notifications ||
                  [];

        setNotifications(notificationList);

        let count = 0;

        if (typeof unreadData === "number") {
            count = unreadData;
        } else if (
            typeof unreadData === "object" &&
            unreadData !== null
        ) {
            count =
                unreadData.count ??
                unreadData.unreadCount ??
                0;
        }

        setUnreadCount(Number(count) || 0);

    } catch (error) {
        console.error(
            "Failed to load notifications:",
            error
        );
    }
};


    // ============================================================
    // INITIAL LOAD + AUTO REFRESH
    // ============================================================

    useEffect(() => {
        loadNotifications();

        // --------------------------------------------------------
        // Check for new notifications every 15 seconds.
        // --------------------------------------------------------

        const interval = window.setInterval(() => {
            loadNotifications();
        }, 30000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);


    // ============================================================
    // OPEN NOTIFICATION MENU
    // ============================================================

    const handleNotificationButton = async () => {
        const willOpen = !notificationMenuOpen;

        setNotificationMenuOpen(willOpen);

        if (willOpen) {
            setProfileMenuOpen(false);
            setNotificationsLoading(true);

            await loadNotifications();

            setNotificationsLoading(false);
        }
    };


    // ============================================================
    // NOTIFICATION NAVIGATION
    // ============================================================

    const getNotificationDestination = (
    notification: NotificationItem
) => {
    const type =
        notification.type?.toLowerCase() || "";

    const referenceType =
        notification.referenceType?.toLowerCase() || "";

    // --------------------------------------------------------
    // BOOKING
    // --------------------------------------------------------

    if (
        type === "booking" ||
        referenceType === "booking"
    ) {
        return "/profile/bookings";
    }

    // --------------------------------------------------------
    // INQUIRY
    // --------------------------------------------------------

    if (
        type === "inquiry" ||
        referenceType === "inquiry"
    ) {
        return "/inquiries";
    }

    // --------------------------------------------------------
    // REVIEW
    // --------------------------------------------------------

    if (
    type === "review" ||
    referenceType === "review"
) {
    return `/reviews?bookingId=${notification.referenceId}`;
}
    // --------------------------------------------------------
    // FALLBACK
    // --------------------------------------------------------

    return "/";
};

    // ============================================================
    // CLICK NOTIFICATION
    // ============================================================

    const handleNotificationClick = async (
        notification: NotificationItem
    ) => {
        try {
            // ----------------------------------------------------
            // Mark as read if it is currently unread.
            // ----------------------------------------------------

            if (!notification.isRead) {
                await markNotificationAsRead(
                    notification.notificationId
                );
            }

            // ----------------------------------------------------
            // Update local state immediately.
            // ----------------------------------------------------

            setNotifications((previous) =>
                previous.map((item) =>
                    item.notificationId ===
                    notification.notificationId
                        ? {
                              ...item,
                              isRead: true,
                          }
                        : item
                )
            );

            setUnreadCount((previous) =>
                notification.isRead
                    ? previous
                    : Math.max(previous - 1, 0)
            );

            // ----------------------------------------------------
            // Close menus.
            // ----------------------------------------------------

            setNotificationMenuOpen(false);
            setMobileMenuOpen(false);

            // ----------------------------------------------------
            // Navigate to the correct area.
            // ----------------------------------------------------

            navigate(
                getNotificationDestination(notification)
            );

        } catch (error) {
            console.error(
                "Failed to open notification:",
                error
            );
        }
    };


    // ============================================================
    // MARK ALL AS READ
    // ============================================================

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            await markAllNotificationsAsRead();

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );

            setUnreadCount(0);

        } catch (error) {
            console.error(
                "Failed to mark notifications as read:",
                error
            );
        }
    };


    // ============================================================
    // FORMAT NOTIFICATION TIME
    // ============================================================

    const formatNotificationTime = (
        createdAt: string
    ) => {
        if (!createdAt) {
            return "";
        }

        const date = new Date(createdAt);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const now = new Date();

        const difference =
            now.getTime() - date.getTime();

        const seconds =
            Math.floor(difference / 1000);

        const minutes =
            Math.floor(seconds / 60);

        const hours =
            Math.floor(minutes / 60);

        const days =
            Math.floor(hours / 24);


        if (seconds < 60) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        if (hours < 24) {
            return `${hours}h ago`;
        }

        if (days < 7) {
            return `${days}d ago`;
        }

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };


    // ============================================================
    // NOTIFICATION ICON
    // ============================================================

    const getNotificationIcon = (
    notification: NotificationItem
) => {
    const type =
        notification.type?.toLowerCase() || "";

    const referenceType =
        notification.referenceType?.toLowerCase() || "";

    // --------------------------------------------------------
    // BOOKING
    // --------------------------------------------------------

    if (
        type === "booking" ||
        referenceType === "booking"
    ) {
        return (
            <CalendarDays
                size={17}
                strokeWidth={2}
            />
        );
    }

    // --------------------------------------------------------
    // INQUIRY
    // --------------------------------------------------------

    if (
        type === "inquiry" ||
        referenceType === "inquiry"
    ) {
        return (
            <Bell
                size={17}
                strokeWidth={2}
            />
        );
    }

    // --------------------------------------------------------
    // REVIEW
    // --------------------------------------------------------

    if (
        type === "review" ||
        referenceType === "review"
    ) {
        return (
            <Star
                size={17}
                strokeWidth={2}
            />
        );
    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return (
        <Bell
            size={17}
            strokeWidth={2}
        />
    );
};


    // ============================================================
    // MEMBER NAME
    // ============================================================

    const getMemberName = () => {
        if (member?.firstName && member?.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }

        if (member?.firstName) {
            return member.firstName;
        }

        if (member?.name) {
            return member.name;
        }

        return "Member";
    };


    // ============================================================
    // MEMBER INITIALS
    // ============================================================

    const getInitials = () => {
        if (member?.firstName && member?.lastName) {
            return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                .toUpperCase();
        }

        if (member?.firstName) {
            return member.firstName
                .charAt(0)
                .toUpperCase();
        }

        if (member?.name) {
            const parts = member.name
                .trim()
                .split(/\s+/);

            if (parts.length >= 2) {
                return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`
                    .toUpperCase();
            }

            return (
                parts[0]?.charAt(0).toUpperCase() ||
                "M"
            );
        }

        return "M";
    };


    // ============================================================
    // NAVIGATION
    // ============================================================

    const navItems = [
        {
            label: "Home",
            path: "/",
        },
        {
            label: "Sports",
            path: "/sports",
        },
        {
            label: "Facilities",
            path: "/facilities",
        },
        {
            label: "Reviews",
            path: "/reviews",
        },
        {
            label: "Inquiries",
            path: "/inquiries",
        },
    ];


    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        logout();

        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
        setNotificationMenuOpen(false);

        navigate("/login", {
            replace: true,
        });
    };


    // ============================================================
    // MOBILE
    // ============================================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    // ============================================================
    // PROFILE DROPDOWN
    // ============================================================

    const closeProfileMenu = () => {
        setProfileMenuOpen(false);
    };


    // ============================================================
    // NAV LINK STYLE
    // ============================================================

    const navLinkClasses = ({
        isActive,
    }: {
        isActive: boolean;
    }) =>
        `relative rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            isActive
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        }`;


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">

            {/* =====================================================
                MAIN NAVBAR
            ===================================================== */}

            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* =================================================
                    LOGO
                ================================================= */}

                <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="group flex shrink-0 items-center gap-3"
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-blue-500 group-hover:shadow-md group-hover:shadow-blue-600/25">

                        <Trophy
                            size={20}
                            strokeWidth={2.2}
                        />

                    </div>

                    <div>

                        <p className="text-[16px] font-bold leading-tight tracking-tight text-slate-950">
                            SportsHub
                        </p>

                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Community Sports
                        </p>

                    </div>

                </Link>


                {/* =================================================
                    DESKTOP NAVIGATION
                ================================================= */}

                <nav className="hidden items-center gap-1 md:flex">

                    {navItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={navLinkClasses}
                        >
                            {item.label}
                        </NavLink>

                    ))}

                </nav>


                {/* =================================================
                    DESKTOP MEMBER AREA
                ================================================= */}

                <div className="relative hidden items-center gap-2 md:flex">

                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    <div className="relative">

                        <button
                            type="button"
                            onClick={handleNotificationButton}
                            aria-label="Notifications"
                            aria-expanded={
                                notificationMenuOpen
                            }
                            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-blue-600"
                        >

                            <Bell
                                size={19}
                                strokeWidth={2}
                                className="transition-transform duration-200 group-hover:scale-105"
                            />


                            {/* UNREAD BADGE */}

                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}

                        </button>


                        {/* =================================================
                            NOTIFICATION DROPDOWN
                        ================================================= */}

                        {notificationMenuOpen && (
                            <>

                                {/* Click outside */}

                                <button
                                    type="button"
                                    aria-label="Close notifications"
                                    onClick={() =>
                                        setNotificationMenuOpen(
                                            false
                                        )
                                    }
                                    className="fixed inset-0 z-40 cursor-default"
                                />


                                <div className="absolute right-0 top-[52px] z-50 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30">

                                    {/* HEADER */}

                                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                                        <div>

                                            <h3 className="text-sm font-bold text-slate-900">
                                                Notifications
                                            </h3>

                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                {unreadCount > 0
                                                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                                    : "You're all caught up"}
                                            </p>

                                        </div>


                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleMarkAllAsRead
                                                }
                                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                            >

                                                <Check
                                                    size={14}
                                                />

                                                Mark all as read

                                            </button>
                                        )}

                                    </div>


                                    {/* NOTIFICATIONS */}

                                    <div className="max-h-[420px] overflow-y-auto">

                                        {notificationsLoading ? (

                                            <div className="px-5 py-10 text-center">

                                                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                                                <p className="mt-3 text-xs font-medium text-slate-400">
                                                    Loading notifications...
                                                </p>

                                            </div>

                                        ) : notifications.length === 0 ? (

                                            <div className="px-5 py-12 text-center">

                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                    <Bell
                                                        size={21}
                                                    />
                                                </div>

                                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                                    No notifications
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    We'll let you know when something changes.
                                                </p>

                                            </div>

                                        ) : (

                                            notifications.map(
                                                (
                                                    notification
                                                ) => (

                                                    <button
                                                        key={
                                                            notification.notificationId
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification
                                                            )
                                                        }
                                                        className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50 ${
                                                            notification.isRead
                                                                ? "bg-white"
                                                                : "bg-blue-50/50"
                                                        }`}
                                                    >

                                                        {/* ICON */}

                                                        <div
                                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                                notification.isRead
                                                                    ? "bg-slate-100 text-slate-500"
                                                                    : "bg-blue-100 text-blue-600"
                                                            }`}
                                                        >

                                                            {getNotificationIcon(
                                                                notification
                                                            )}

                                                        </div>


                                                        {/* CONTENT */}

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-start justify-between gap-2">

                                                                <p
                                                                    className={`text-sm ${
                                                                        notification.isRead
                                                                            ? "font-semibold text-slate-700"
                                                                            : "font-bold text-slate-900"
                                                                    }`}
                                                                >
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </p>


                                                                {!notification.isRead && (
                                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                                )}

                                                            </div>


                                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>


                                                            <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                                                                {formatNotificationTime(
                                                                    notification.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </button>

                                                )
                                            )

                                        )}

                                    </div>

                                </div>

                            </>
                        )}

                    </div>


                    {/* =================================================
                        PROFILE BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() =>
                            setProfileMenuOpen(
                                (previous) => !previous
                            )
                        }
                        aria-expanded={profileMenuOpen}
                        aria-haspopup="menu"
                        className="group flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-blue-100">
                            {getInitials()}
                        </div>


                        <div className="max-w-[125px] text-left">

                            <p className="truncate text-sm font-semibold text-slate-800">
                                {getMemberName()}
                            </p>

                            <p className="text-[11px] font-medium text-slate-400">
                                Member
                            </p>

                        </div>


                        <ChevronDown
                            size={15}
                            className={`ml-1 text-slate-400 transition-transform duration-200 ${
                                profileMenuOpen
                                    ? "rotate-180"
                                    : ""
                            }`}
                        />

                    </button>


                    {/* =================================================
                        PROFILE DROPDOWN
                    ================================================= */}

                    {profileMenuOpen && (
                        <>

                            <button
                                type="button"
                                aria-label="Close profile menu"
                                onClick={closeProfileMenu}
                                className="fixed inset-0 z-40 cursor-default"
                            />


                            <div
                                role="menu"
                                className="absolute right-0 top-[56px] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30"
                            >

                                {/* PROFILE HEADER */}

                                <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                                            {getInitials()}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-bold text-slate-900">
                                                {getMemberName()}
                                            </p>

                                            {member?.email && (
                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {member.email}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </div>


                                {/* PROFILE LINKS */}

                                <div className="p-2">

                                    <Link
                                        to="/dashboard"
                                        onClick={closeProfileMenu}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                                        role="menuitem"
                                    >

                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <User size={17} />
                                        </span>

                                        <span>
                                            <span className="block">
                                                My Dashbord
                                            </span>

                                            <span className="mt-0.5 block text-xs font-normal text-slate-400">
                                                View your Profile and account details 
                                            </span>
                                        </span>

                                    </Link>


                                    <Link
                                        to="/profile/bookings"
                                        onClick={closeProfileMenu}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                                        role="menuitem"
                                    >

                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <CalendarDays size={17} />
                                        </span>

                                        <span>
                                            <span className="block">
                                                My Bookings
                                            </span>

                                            <span className="mt-0.5 block text-xs font-normal text-slate-400">
                                                View and manage bookings
                                            </span>
                                        </span>

                                    </Link>


                                    <Link
                                        to="/profile/sports"
                                        onClick={closeProfileMenu}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                                        role="menuitem"
                                    >

                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <Trophy size={17} />
                                        </span>

                                        <span>
                                            <span className="block">
                                                My Sports
                                            </span>

                                            <span className="mt-0.5 block text-xs font-normal text-slate-400">
                                                Manage your favourite sports
                                            </span>
                                        </span>

                                    </Link>


                                    <Link
                                        to="/settings"
                                        onClick={closeProfileMenu}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                                        role="menuitem"
                                    >

                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <Settings size={17} />
                                        </span>

                                        <span>
                                            <span className="block">
                                                Settings
                                            </span>

                                            <span className="mt-0.5 block text-xs font-normal text-slate-400">
                                                Account and security
                                            </span>
                                        </span>

                                    </Link>

                                </div>


                                {/* LOGOUT */}

                                <div className="border-t border-slate-100 p-2">

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                    >

                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                                            <LogOut size={17} />
                                        </span>

                                        Logout

                                    </button>

                                </div>

                            </div>

                        </>
                    )}

                </div>


                {/* =================================================
                    MOBILE MENU BUTTON
                ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        setMobileMenuOpen(
                            (previous) => !previous
                        )
                    }
                    aria-label={
                        mobileMenuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={mobileMenuOpen}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600 md:hidden"
                >

                    {mobileMenuOpen ? (
                        <X size={21} />
                    ) : (
                        <Menu size={21} />
                    )}

                </button>

            </div>


            {/* =====================================================
                MOBILE NAVIGATION
            ===================================================== */}

            {mobileMenuOpen && (

                <div className="border-t border-slate-100 bg-white md:hidden">

                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                        {/* MEMBER HEADER */}

                        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                                {getInitials()}
                            </div>

                            <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-slate-900">
                                    {getMemberName()}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                    {member?.email ||
                                        "Community Member"}
                                </p>

                            </div>

                        </div>


                        {/* MAIN NAV */}

                        <nav className="space-y-1">

                            {navItems.map((item) => (

                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                        }`
                                    }
                                >

                                    {({ isActive }) => (
                                        <>
                                            <span>
                                                {item.label}
                                            </span>

                                            {isActive && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                            )}
                                        </>
                                    )}

                                </NavLink>

                            ))}

                        </nav>


                        {/* MEMBER ACTIONS */}

                        <div className="my-4 border-t border-slate-100" />


                        <nav className="space-y-1">

                            {/* MY PROFILE */}

                            <NavLink
                                to="/profile"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                    }`
                                }
                            >

                                <User size={18} />

                                My Profile =

                            </NavLink>


                            {/* MY BOOKINGS */}

                            <NavLink
                                to="/profile/bookings"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                    }`
                                }
                            >

                                <CalendarDays size={18} />

                                My Bookings

                            </NavLink>


                            {/* MY SPORTS */}

                            <NavLink
                                to="/profile/sports"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                    }`
                                }
                            >

                                <Trophy size={18} />

                                My Sports

                            </NavLink>


                            {/* SETTINGS */}

                            <NavLink
                                to="/settings"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                    }`
                                }
                            >

                                <Settings size={18} />

                                Settings

                            </NavLink>


                            {/* =================================================
                                MOBILE NOTIFICATIONS
                            ================================================= */}

                            <button
                                type="button"
                                onClick={handleNotificationButton}
                                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                            >

                                <span className="flex items-center gap-3">

                                    <Bell size={18} />

                                    Notifications

                                </span>


                                {unreadCount > 0 && (
                                    <span className="flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}
                                    </span>
                                )}

                            </button>


                            {/* =================================================
                                MOBILE NOTIFICATION LIST
                            ================================================= */}

                            {notificationMenuOpen && (

                                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

                                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Notifications
                                        </span>


                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleMarkAllAsRead
                                                }
                                                className="text-xs font-semibold text-blue-600"
                                            >
                                                Mark all read
                                            </button>
                                        )}

                                    </div>


                                    <div className="max-h-[360px] overflow-y-auto">

                                        {notifications.length === 0 ? (

                                            <div className="px-4 py-8 text-center">

                                                <Bell
                                                    size={20}
                                                    className="mx-auto text-slate-400"
                                                />

                                                <p className="mt-2 text-xs font-medium text-slate-500">
                                                    No notifications
                                                </p>

                                            </div>

                                        ) : (

                                            notifications.map(
                                                (
                                                    notification
                                                ) => (

                                                    <button
                                                        key={
                                                            notification.notificationId
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification
                                                            )
                                                        }
                                                        className={`flex w-full gap-3 border-b border-slate-200 px-4 py-3 text-left ${
                                                            notification.isRead
                                                                ? "bg-slate-50"
                                                                : "bg-blue-50"
                                                        }`}
                                                    >

                                                        <div
                                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                                notification.isRead
                                                                    ? "bg-slate-200 text-slate-500"
                                                                    : "bg-blue-100 text-blue-600"
                                                            }`}
                                                        >

                                                            {getNotificationIcon(
                                                                notification
                                                            )}

                                                        </div>


                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-start justify-between gap-2">

                                                                <p className="text-xs font-bold text-slate-800">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </p>

                                                                {!notification.isRead && (
                                                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                                                )}

                                                            </div>


                                                            <p className="mt-1 text-[11px] leading-4 text-slate-500">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>


                                                            <p className="mt-1 text-[10px] text-slate-400">
                                                                {formatNotificationTime(
                                                                    notification.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </button>

                                                )
                                            )

                                        )}

                                    </div>

                                </div>

                            )}


                            {/* LOGOUT */}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >

                                <LogOut size={18} />

                                Logout

                            </button>

                        </nav>

                    </div>

                </div>

            )}

        </header>
    );
}