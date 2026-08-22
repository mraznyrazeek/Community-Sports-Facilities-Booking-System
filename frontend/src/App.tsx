import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Dumbbell,
  Home,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Star,
  Trophy,
  User,
  Users,
  ArrowUpRight,
  Menu,
  LogOut,
} from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">

        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Trophy size={24} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                SportsHub
              </h1>
              <p className="text-xs text-slate-500">
                Sports Booking
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>

            <div className="space-y-1">

              <NavItem
                icon={<Home size={19} />}
                label="Dashboard"
                active
              />

              <NavItem
                icon={<CalendarDays size={19} />}
                label="My Bookings"
              />

              <NavItem
                icon={<Dumbbell size={19} />}
                label="Sports"
              />

              <NavItem
                icon={<MapPin size={19} />}
                label="Facilities"
              />

              <NavItem
                icon={<Star size={19} />}
                label="My Reviews"
              />

              <NavItem
                icon={<MessageSquare size={19} />}
                label="Inquiries"
              />

            </div>

            <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account
            </p>

            <div className="space-y-1">

              <NavItem
                icon={<User size={19} />}
                label="Profile"
              />

              <NavItem
                icon={<Settings size={19} />}
                label="Settings"
              />

            </div>

          </nav>

          {/* User */}
          <div className="border-t border-slate-100 p-4">

            <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                R
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  Razny
                </p>

                <p className="truncate text-xs text-slate-500">
                  Member
                </p>
              </div>

              <LogOut
                size={17}
                className="cursor-pointer text-slate-400 hover:text-red-500"
              />

            </div>

          </div>

        </div>
      </aside>


      {/* ================= MAIN ================= */}
      <main className="lg:ml-64">

        {/* TOP BAR */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">

          <div className="flex items-center gap-4">

            <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm text-slate-500">
                Welcome back 👋
              </p>

              <h2 className="text-lg font-bold">
                Good morning, Razny
              </h2>
            </div>

          </div>


          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={18} className="text-slate-400" />

              <input
                placeholder="Search facilities..."
                className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Notification */}
            <button className="relative rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50">
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              R
            </div>

          </div>

        </header>


        {/* CONTENT */}
        <div className="p-5 md:p-8">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-7 text-white shadow-xl shadow-blue-200 md:p-9">

            <div className="relative z-10 max-w-2xl">

              <p className="mb-2 text-sm font-medium text-blue-100">
                YOUR SPORTS JOURNEY
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Find your next game.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 md:text-base">
                Discover sports facilities, book your favourite venue,
                and keep track of all your activities in one place.
              </p>

              <button className="mt-6 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50">
                Explore Facilities
                <ArrowUpRight size={17} />
              </button>

            </div>

            {/* Decorative circles */}
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-white/5" />

          </section>


          {/* STATISTICS */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<CalendarDays size={21} />}
              label="Total Bookings"
              value="12"
              change="+2 this month"
            />

            <StatCard
              icon={<Clock3 size={21} />}
              label="Upcoming"
              value="3"
              change="Next: Tomorrow"
            />

            <StatCard
              icon={<Trophy size={21} />}
              label="Sports Joined"
              value="4"
              change="Football, Tennis..."
            />

            <StatCard
              icon={<Star size={21} />}
              label="Reviews"
              value="8"
              change="4.8 average rating"
            />

          </section>


          {/* MAIN GRID */}
          <div className="mt-8 grid gap-7 xl:grid-cols-3">

            {/* UPCOMING BOOKINGS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-900">
                    Upcoming Bookings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your next scheduled activities
                  </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all
                  <ChevronRight size={16} />
                </button>

              </div>


              <BookingCard
                sport="Football"
                facility="City Sports Arena"
                date="Saturday, 24 Aug"
                time="6:00 PM - 7:00 PM"
                location="Colombo"
                icon="⚽"
              />

              <BookingCard
                sport="Tennis"
                facility="Royal Tennis Club"
                date="Monday, 26 Aug"
                time="5:30 PM - 6:30 PM"
                location="Colombo"
                icon="🎾"
              />

              <BookingCard
                sport="Basketball"
                facility="Community Sports Center"
                date="Wednesday, 28 Aug"
                time="7:00 PM - 8:00 PM"
                location="Colombo"
                icon="🏀"
              />

            </section>


            {/* QUICK ACTIONS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="font-bold">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your sports activities
              </p>


              <div className="mt-5 space-y-3">

                <QuickAction
                  icon={<CalendarDays size={20} />}
                  title="Book a Facility"
                  description="Find and reserve a venue"
                />

                <QuickAction
                  icon={<Dumbbell size={20} />}
                  title="Join a Sport"
                  description="Explore available sports"
                />

                <QuickAction
                  icon={<Star size={20} />}
                  title="Write a Review"
                  description="Share your experience"
                />

                <QuickAction
                  icon={<MessageSquare size={20} />}
                  title="Send an Inquiry"
                  description="Contact the sports team"
                />

              </div>

            </section>

          </div>


          {/* FACILITIES */}
          <section className="mt-8">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Popular Facilities
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Discover places to play
                </p>
              </div>

              <button className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                View all
                <ChevronRight size={16} />
              </button>

            </div>


            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              <FacilityCard
                emoji="⚽"
                name="City Sports Arena"
                sport="Football"
                location="Colombo"
                rating="4.8"
              />

              <FacilityCard
                emoji="🎾"
                name="Royal Tennis Club"
                sport="Tennis"
                location="Colombo"
                rating="4.7"
              />

              <FacilityCard
                emoji="🏀"
                name="Community Sports Center"
                sport="Basketball"
                location="Colombo"
                rating="4.9"
              />

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


/* ================= COMPONENTS ================= */

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      <span>{label}</span>

      {active && (
        <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
      )}
    </button>
  );
}


function StatCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <ArrowUpRight size={17} className="text-slate-300" />

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-3">

        <span className="text-2xl font-bold">
          {value}
        </span>

        <span className="mb-1 text-xs font-medium text-emerald-600">
          {change}
        </span>

      </div>

    </div>
  );
}


function BookingCard({
  sport,
  facility,
  date,
  time,
  location,
  icon,
}: {
  sport: string;
  facility: string;
  date: string;
  time: string;
  location: string;
  icon: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">
            {facility}
          </h3>

          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            {sport}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">

          <span className="flex items-center gap-1">
            <CalendarDays size={13} />
            {date}
          </span>

          <span className="flex items-center gap-1">
            <Clock3 size={13} />
            {time}
          </span>

          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {location}
          </span>

        </div>

      </div>

      <button className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-white sm:block">
        Details
      </button>

    </div>
  );
}


function QuickAction({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {description}
        </p>

      </div>

      <ChevronRight size={17} className="text-slate-300" />

    </button>
  );
}


function FacilityCard({
  emoji,
  name,
  sport,
  location,
  rating,
}: {
  emoji: string;
  name: string;
  sport: string;
  location: string;
  rating: string;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">

      {/* Image placeholder */}
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-6xl">
        {emoji}
      </div>

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div>
            <h3 className="font-bold">
              {name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {sport}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
            <Star size={13} fill="currentColor" />
            {rating}
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <span className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={15} />
            {location}
          </span>

          <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
            View
            <ChevronRight size={15} />
          </button>

        </div>

      </div>

    </div>
  );
}


export default App;