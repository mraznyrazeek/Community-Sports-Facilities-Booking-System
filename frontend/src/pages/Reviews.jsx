import { Star } from "lucide-react";

export default function Reviews() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Reviews
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage your facility reviews.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                <Star
                    size={45}
                    className="mx-auto text-gray-300"
                />

                <h2 className="mt-5 text-xl font-semibold">
                    No reviews yet
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Reviews you create will appear here.
                </p>
            </div>
        </div>
    );
}