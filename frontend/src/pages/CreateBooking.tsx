import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    Trophy,
    AlertTriangle,
} from "lucide-react";

import {
    createBooking,
    getFacility,
    getBookingAvailability,
    getMyBookings,
} from "../services/api";

interface Facility {
    facilityId: number;
    sportId?: number;
    facilityName: string;
    description?: string;
    location?: string;
    address?: string;
    openingTime?: string;
    closingTime?: string;
    status?: string;

    sport?: {
        sportId: number;
        sportName: string;
        description?: string;
    };
}


interface ExistingBooking {
    bookingId: number;
    startTime: string;
    endTime: string;
    status: string;
}


interface MyBooking {
    bookingId: number;
    memberId: number;
    facilityId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt?: string;

    facility?: {
        facilityId: number;
        facilityName: string;
        location?: string;
        status?: string;
    };
}


export default function CreateBooking() {

    const [searchParams] = useSearchParams();

    const facilityId = searchParams.get("facilityId");

    const [facility, setFacility] =
        useState<Facility | null>(null);

    const [facilityLoading, setFacilityLoading] =
        useState(true);

    const [bookingDate, setBookingDate] =
        useState("");

    const [startTime, setStartTime] =
        useState("");

    const [endTime, setEndTime] =
        useState("");

    const [existingBookings, setExistingBookings] =
        useState<ExistingBooking[]>([]);

    const [availabilityLoading, setAvailabilityLoading] =
        useState(false);

    const [myBookings, setMyBookings] =
        useState<MyBooking[]>([]);

    const [myBookingsLoading, setMyBookingsLoading] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [personalConflict, setPersonalConflict] =
        useState("");

    const [facilityConflict, setFacilityConflict] =
        useState("");

    const minimumDate = useMemo(() => {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }, []);


    useEffect(() => {

        const loadFacility = async () => {

            if (!facilityId) {

                setError(
                    "No facility was selected."
                );

                setFacilityLoading(false);

                return;
            }

            try {

                setFacilityLoading(true);

                setError("");

                const data =
                    await getFacility(facilityId);

                setFacility(data);

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load facility."
                );

            } finally {

                setFacilityLoading(false);

            }
        };


        loadFacility();

    }, [facilityId]);


    useEffect(() => {

        const loadMyBookings = async () => {

            try {

                setMyBookingsLoading(true);

                const data =
                    await getMyBookings();

                setMyBookings(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Unable to load member bookings:",
                    err
                );

                setMyBookings([]);

            } finally {

                setMyBookingsLoading(false);

            }
        };


        loadMyBookings();

    }, []);


    useEffect(() => {

        const loadAvailability = async () => {

            if (!facilityId || !bookingDate) {

                setExistingBookings([]);

                return;
            }

            try {

                setAvailabilityLoading(true);

                setFacilityConflict("");

                const data =
                    await getBookingAvailability(
                        Number(facilityId),
                        bookingDate
                    );

                setExistingBookings(
                    Array.isArray(data?.bookings)
                        ? data.bookings
                        : []
                );

            } catch (err) {

                console.error(
                    "Unable to check facility availability:",
                    err
                );

                setExistingBookings([]);

            } finally {

                setAvailabilityLoading(false);

            }
        };


        loadAvailability();

    }, [facilityId, bookingDate]);

    const formatTime = (
        time?: string
    ) => {

        if (!time) {
            return "--";
        }

        const value =
            String(time).substring(0, 5);

        const parts =
            value.split(":");

        if (parts.length < 2) {
            return value;
        }

        const hours =
            Number(parts[0]);

        const minutes =
            parts[1];

        if (Number.isNaN(hours)) {
            return value;
        }

        const period =
            hours >= 12 ? "PM" : "AM";

        const displayHour =
            hours % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    };


    const formattedBookingDate =
        useMemo(() => {

            if (!bookingDate) {
                return "Select a date";
            }

            const [
                year,
                month,
                day,
            ] = bookingDate.split("-");

            return `${day}/${month}/${year}`;

        }, [bookingDate]);

    const timeToMinutes = (
        time: string
    ): number => {

        const [
            hours,
            minutes,
        ] = time
            .substring(0, 5)
            .split(":")
            .map(Number);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
        ) {
            return -1;
        }

        return (
            hours * 60 +
            minutes
        );
    };

    const timesOverlap = (
        requestedStart: string,
        requestedEnd: string,
        existingStart: string,
        existingEnd: string
    ) => {

        const requestedStartMinutes =
            timeToMinutes(requestedStart);

        const requestedEndMinutes =
            timeToMinutes(requestedEnd);

        const existingStartMinutes =
            timeToMinutes(existingStart);

        const existingEndMinutes =
            timeToMinutes(existingEnd);


        if (
            requestedStartMinutes < 0 ||
            requestedEndMinutes < 0 ||
            existingStartMinutes < 0 ||
            existingEndMinutes < 0
        ) {
            return false;
        }


        return (
            requestedStartMinutes <
                existingEndMinutes &&
            requestedEndMinutes >
                existingStartMinutes
        );
    };

    const findFacilityConflict = () => {

        if (
            !bookingDate ||
            !startTime ||
            !endTime
        ) {
            return null;
        }


        const conflict =
            existingBookings.find(
                (booking) =>
                    booking.status
                        ?.toLowerCase() !==
                        "cancelled" &&
                    timesOverlap(
                        startTime,
                        endTime,
                        booking.startTime,
                        booking.endTime
                    )
            );


        return conflict || null;
    };


    const findPersonalConflict = () => {

        if (
            !bookingDate ||
            !startTime ||
            !endTime
        ) {
            return null;
        }


        const conflict =
            myBookings.find(
                (booking) => {

                    const isSameDate =
                        String(
                            booking.bookingDate
                        ).substring(0, 10) ===
                        bookingDate;

                    const isActive =
                        booking.status
                            ?.toLowerCase() !==
                            "cancelled";


                    if (
                        !isSameDate ||
                        !isActive
                    ) {
                        return false;
                    }


                    return timesOverlap(
                        startTime,
                        endTime,
                        booking.startTime,
                        booking.endTime
                    );
                }
            );


        return conflict || null;
    };


    const validateBooking = () => {

        if (!facilityId) {

            return "No facility was selected.";

        }


        if (!bookingDate) {

            return "Please select a booking date.";

        }


        if (!startTime) {

            return "Please select a start time.";

        }


        if (!endTime) {

            return "Please select an end time.";

        }


        if (bookingDate < minimumDate) {

            return "Please select a valid booking date.";

        }


        if (startTime >= endTime) {

            return "End time must be later than start time.";

        }

        if (
            facility?.openingTime &&
            facility?.closingTime
        ) {

            const opening =
                facility.openingTime
                    .substring(0, 5);

            const closing =
                facility.closingTime
                    .substring(0, 5);


            if (
                startTime < opening ||
                endTime > closing
            ) {

                return (
                    `The booking must be within the facility's ` +
                    `${formatTime(opening)} — ${formatTime(closing)} opening hours.`
                );

            }

        }

        const facilityConflict =
            findFacilityConflict();


        if (facilityConflict) {

            return (
                `This facility is already booked from ` +
                `${formatTime(facilityConflict.startTime)} ` +
                `to ${formatTime(facilityConflict.endTime)}. ` +
                `Please choose another time.`
            );

        }

        const personalConflict =
            findPersonalConflict();


        if (personalConflict) {

            const facilityName =
                personalConflict.facility?.facilityName ||
                `Facility #${personalConflict.facilityId}`;


            return (
                `You already have a booking at ` +
                `${facilityName} from ` +
                `${formatTime(personalConflict.startTime)} ` +
                `to ${formatTime(personalConflict.endTime)} ` +
                `on this date. You cannot make another booking during the same time.`
            );

        }


        return "";

    };


    useEffect(() => {

        setFacilityConflict("");

        setPersonalConflict("");


        if (
            !bookingDate ||
            !startTime ||
            !endTime ||
            startTime >= endTime
        ) {
            return;
        }

        const facilityConflict =
            findFacilityConflict();


        if (facilityConflict) {

            setFacilityConflict(
                `This facility is already booked from ` +
                `${formatTime(facilityConflict.startTime)} ` +
                `to ${formatTime(facilityConflict.endTime)}.`
            );

        }

        const personalConflict =
            findPersonalConflict();


        if (personalConflict) {

            const facilityName =
                personalConflict.facility?.facilityName ||
                `Facility #${personalConflict.facilityId}`;


            setPersonalConflict(
                `You already have a booking at ${facilityName} ` +
                `from ${formatTime(personalConflict.startTime)} ` +
                `to ${formatTime(personalConflict.endTime)}.`
            );

        }

    }, [
        bookingDate,
        startTime,
        endTime,
        existingBookings,
        myBookings,
    ]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        setError("");

        setSuccess("");


        const validationError =
            validateBooking();


        if (validationError) {

            setError(validationError);

            return;

        }


        try {

            setLoading(true);


            await createBooking({

                facilityId:
                    Number(facilityId),

                bookingDate,

                startTime,

                endTime,

            });


            setSuccess(
                "Your booking request has been submitted successfully. An administrator can confirm it."
            );


            setStartTime("");

            setEndTime("");

            try {

                const availability =
                    await getBookingAvailability(
                        Number(facilityId),
                        bookingDate
                    );


                setExistingBookings(
                    Array.isArray(
                        availability?.bookings
                    )
                        ? availability.bookings
                        : []
                );

            } catch {
                // Do nothing if refresh fails.
            }

            try {

                const updatedMyBookings =
                    await getMyBookings();


                setMyBookings(
                    Array.isArray(
                        updatedMyBookings
                    )
                        ? updatedMyBookings
                        : []
                );

            } catch {
                // Do nothing if refresh fails.
            }


        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create booking."
            );

        } finally {

            setLoading(false);

        }

    };


    if (!facilityId) {

        return (

            <main className="min-h-[calc(100vh-80px)] bg-slate-50">

                <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">

                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

                            <MapPin size={28} />

                        </div>


                        <h1 className="mt-6 text-2xl font-bold text-slate-900">

                            No facility selected

                        </h1>


                        <p className="mt-3 text-sm leading-6 text-slate-500">

                            Please select a facility before creating a
                            booking.

                        </p>


                        <Link
                            to="/facilities"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >

                            <ArrowLeft size={17} />

                            Browse Facilities

                        </Link>

                    </div>

                </div>

            </main>

        );

    }

    return (

        <main className="min-h-[calc(100vh-80px)] bg-slate-50">

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">


                <Link
                    to={`/facility/${facilityId}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >

                    <ArrowLeft size={17} />

                    Back to Facility

                </Link>


                <div className="mt-7">

                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-600">

                        <CalendarDays size={14} />

                        Facility Booking

                    </div>


                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                        Book your next session

                    </h1>


                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">

                        Choose your preferred date and time to reserve
                        this facility.

                    </p>

                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">


                    <div className="lg:col-span-2">

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">


                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-8 sm:px-7">

                                <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                                <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />


                                <div className="relative">

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">

                                        <Trophy size={27} />

                                    </div>


                                    <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-blue-100">

                                        Selected Facility

                                    </p>


                                    {facilityLoading ? (

                                        <>

                                            <div className="mt-3 h-7 w-3/4 animate-pulse rounded-lg bg-white/20" />

                                            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-white/20" />

                                        </>

                                    ) : (

                                        <>

                                            <h2 className="mt-2 text-2xl font-bold text-white">

                                                {facility?.facilityName ||
                                                    `Facility #${facilityId}`}

                                            </h2>


                                            <p className="mt-2 text-sm text-blue-100">

                                                {facility?.sport?.sportName ||
                                                    "Sports Facility"}

                                            </p>

                                        </>

                                    )}

                                </div>

                            </div>



                            <div className="p-6 sm:p-7">

                                {facilityLoading ? (

                                    <div className="space-y-5">

                                        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />

                                        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />

                                        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />

                                    </div>

                                ) : (

                                    <div className="space-y-5">


                                        {/* LOCATION */}

                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                <MapPin size={18} />

                                            </div>


                                            <div className="min-w-0">

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                                                    Location

                                                </p>


                                                <p className="mt-1 text-sm font-medium text-slate-700">

                                                    {facility?.location ||
                                                        facility?.address ||
                                                        "Location not available"}

                                                </p>

                                            </div>

                                        </div>


                                        {/* OPENING HOURS */}

                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                                                <Clock3 size={18} />

                                            </div>


                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                                                    Opening Hours

                                                </p>


                                                <p className="mt-1 text-sm font-medium text-slate-700">

                                                    {formatTime(
                                                        facility?.openingTime
                                                    )}

                                                    {" — "}

                                                    {formatTime(
                                                        facility?.closingTime
                                                    )}

                                                </p>

                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                                                <Trophy size={18} />

                                            </div>


                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                                                    Facility Status

                                                </p>


                                                <div className="mt-1 flex items-center gap-2">

                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            String(
                                                                facility?.status ||
                                                                    ""
                                                            ).toLowerCase() ===
                                                            "active"
                                                                ? "bg-emerald-500"
                                                                : "bg-slate-400"
                                                        }`}
                                                    />


                                                    <span className="text-sm font-medium text-slate-700">

                                                        {facility?.status ||
                                                            "Available"}

                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                <div className="my-6 h-px bg-slate-100" />


                                <div className="rounded-2xl bg-slate-50 p-4">

                                    <div className="flex items-start gap-3">

                                        <CalendarDays
                                            size={18}
                                            className="mt-0.5 shrink-0 text-blue-600"
                                        />


                                        <div>

                                            <p className="text-sm font-semibold text-slate-900">

                                                Your reservation

                                            </p>


                                            <p className="mt-1 text-xs leading-5 text-slate-500">

                                                Select a date and time on the
                                                right to create your booking.

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="lg:col-span-3">

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">


                            <div>

                                <h2 className="text-xl font-bold text-slate-900">

                                    Booking details

                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    Select when you would like to use the
                                    facility.

                                </p>

                            </div>


                            {error && (

                                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">

                                        <AlertTriangle size={17} />

                                    </div>


                                    <div>

                                        <p className="text-sm font-semibold text-red-800">

                                            Booking could not be created

                                        </p>


                                        <p className="mt-1 text-sm leading-5 text-red-700">

                                            {error}

                                        </p>

                                    </div>

                                </div>

                            )}

                            {success && (

                                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">

                                        <CheckCircle2 size={18} />

                                    </div>


                                    <div>

                                        <p className="text-sm font-semibold text-emerald-800">

                                            Booking request submitted

                                        </p>


                                        <p className="mt-1 text-sm leading-5 text-emerald-700">

                                            {success}

                                        </p>


                                        <Link
                                            to="/profile/bookings"
                                            className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                        >

                                            View my bookings →

                                        </Link>

                                    </div>

                                </div>

                            )}


                            <form
                                onSubmit={handleSubmit}
                                className="mt-7 space-y-6"
                            >


                                <div>

                                    <label
                                        htmlFor="bookingDate"
                                        className="mb-2.5 block text-sm font-semibold text-slate-800"
                                    >

                                        Booking date

                                    </label>


                                    <div className="relative">

                                        <CalendarDays
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />


                                        <input
                                            id="bookingDate"
                                            type="date"
                                            value={bookingDate}
                                            min={minimumDate}
                                            onChange={(event) => {

                                                setBookingDate(
                                                    event.target.value
                                                );

                                                setError("");

                                                setSuccess("");

                                                setFacilityConflict("");

                                                setPersonalConflict("");

                                            }}
                                            className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                        />

                                    </div>


                                    {bookingDate && (

                                        <p className="mt-2 text-xs font-medium text-blue-600">

                                            Selected:{" "}

                                            {formattedBookingDate}

                                        </p>

                                    )}

                                </div>



                                {bookingDate && (

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                                        {availabilityLoading ? (

                                            <div className="flex items-center gap-3">

                                                <Loader2
                                                    size={20}
                                                    className="animate-spin text-blue-600"
                                                />

                                                <div>

                                                    <p className="text-sm font-semibold text-slate-800">

                                                        Checking availability...

                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">

                                                        Checking existing bookings
                                                        for this facility.

                                                    </p>

                                                </div>

                                            </div>

                                        ) : existingBookings.length === 0 ? (

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                                                    <CheckCircle2 size={20} />

                                                </div>


                                                <div>

                                                    <p className="text-sm font-semibold text-slate-900">

                                                        No bookings for this date

                                                    </p>


                                                    <p className="mt-1 text-xs leading-5 text-slate-500">

                                                        The facility currently has
                                                        no active bookings on this
                                                        date.

                                                    </p>

                                                </div>

                                            </div>

                                        ) : (

                                            <div>

                                                <div className="flex items-start gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                                                        <CalendarDays size={19} />

                                                    </div>


                                                    <div>

                                                        <p className="text-sm font-semibold text-slate-900">

                                                            {existingBookings.length}{" "}
                                                            existing booking
                                                            {existingBookings.length !== 1
                                                                ? "s"
                                                                : ""}

                                                        </p>


                                                        <p className="mt-1 text-xs text-slate-500">

                                                            Choose a time that does
                                                            not overlap with an
                                                            existing booking.

                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="mt-4 space-y-2">

                                                    {existingBookings.map(
                                                        (booking) => (

                                                            <div
                                                                key={
                                                                    booking.bookingId
                                                                }
                                                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                                                            >

                                                                <div className="flex items-center gap-3">

                                                                    <Clock3
                                                                        size={18}
                                                                        className="text-slate-400"
                                                                    />


                                                                    <span className="text-sm font-semibold text-slate-800">

                                                                        {formatTime(
                                                                            booking.startTime
                                                                        )}

                                                                        {" — "}

                                                                        {formatTime(
                                                                            booking.endTime
                                                                        )}

                                                                    </span>

                                                                </div>


                                                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">

                                                                    {booking.status}

                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                )}


                                {personalConflict && (

                                    <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">

                                            <AlertTriangle size={18} />

                                        </div>


                                        <div>

                                            <p className="text-sm font-semibold text-orange-900">

                                                You already have a booking at
                                                this time

                                            </p>


                                            <p className="mt-1 text-sm leading-5 text-orange-800">

                                                {personalConflict}

                                            </p>


                                            <p className="mt-2 text-xs font-medium text-orange-700">

                                                Please choose a different time
                                                or date.

                                            </p>

                                        </div>

                                    </div>

                                )}


                                {facilityConflict && (

                                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                            <AlertTriangle size={18} />

                                        </div>


                                        <div>

                                            <p className="text-sm font-semibold text-red-900">

                                                Facility is already booked

                                            </p>


                                            <p className="mt-1 text-sm leading-5 text-red-800">

                                                {facilityConflict}

                                            </p>


                                            <p className="mt-2 text-xs font-medium text-red-700">

                                                Please choose another time.

                                            </p>

                                        </div>

                                    </div>

                                )}


                                <div>

                                    <div className="mb-2.5 flex items-center justify-between">

                                        <label className="text-sm font-semibold text-slate-800">

                                            Booking time

                                        </label>


                                        <span className="text-xs text-slate-400">

                                            Choose your session

                                        </span>

                                    </div>


                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                                        {/* START */}

                                        <div>

                                            <label
                                                htmlFor="startTime"
                                                className="mb-2 block text-xs font-medium text-slate-500"
                                            >

                                                Start time

                                            </label>


                                            <div className="relative">

                                                <Clock3
                                                    size={18}
                                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                />


                                                <input
                                                    id="startTime"
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(event) => {

                                                        setStartTime(
                                                            event.target.value
                                                        );

                                                        setError("");

                                                        setSuccess("");

                                                    }}
                                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                />

                                            </div>

                                        </div>


                                        {/* END */}

                                        <div>

                                            <label
                                                htmlFor="endTime"
                                                className="mb-2 block text-xs font-medium text-slate-500"
                                            >

                                                End time

                                            </label>


                                            <div className="relative">

                                                <Clock3
                                                    size={18}
                                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                />


                                                <input
                                                    id="endTime"
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(event) => {

                                                        setEndTime(
                                                            event.target.value
                                                        );

                                                        setError("");

                                                        setSuccess("");

                                                    }}
                                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                />

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {(bookingDate ||
                                    startTime ||
                                    endTime) && (

                                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">

                                            Booking summary

                                        </p>


                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">


                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Date

                                                </p>


                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {bookingDate
                                                        ? formattedBookingDate
                                                        : "Not selected"}

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Starts

                                                </p>


                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {startTime
                                                        ? formatTime(
                                                              startTime
                                                          )
                                                        : "Not selected"}

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Ends

                                                </p>


                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {endTime
                                                        ? formatTime(
                                                              endTime
                                                          )
                                                        : "Not selected"}

                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        availabilityLoading ||
                                        myBookingsLoading ||
                                        !!facilityConflict ||
                                        !!personalConflict
                                    }
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading ? (

                                        <>

                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Creating Booking...

                                        </>

                                    ) : (

                                        <>

                                            <CalendarDays size={18} />

                                            Confirm Booking

                                        </>

                                    )}

                                </button>


                                <p className="text-center text-xs leading-5 text-slate-400">

                                    Your booking request will be checked
                                    against existing facility bookings and
                                    your other bookings.

                                </p>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </main>

    );
}