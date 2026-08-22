import { MapPin, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FacilityCard({ facility }) {
    const navigate = useNavigate();

    return (
        <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            {/* Image placeholder */}
            <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                <span className="text-5xl">🏟️</span>

                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-600">
                    {facility?.status || "Available"}
                </span>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {facility?.sport?.sportName || "Sports Facility"}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-gray-900">
                        {facility?.facilityName || "Facility"}
                    </h3>
                </div>

                <p className="line-clamp-2 text-sm text-gray-500">
                    {facility?.description ||
                        "A great community sports facility."}
                </p>

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>
                            {facility?.location || "Location unavailable"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>
                            {facility?.openingTime || "--"} -{" "}
                            {facility?.closingTime || "--"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() =>
                        navigate(`/facilities/${facility?.facilityId}`)
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                    View Facility

                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}