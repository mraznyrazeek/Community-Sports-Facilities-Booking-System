import { MessageSquare } from "lucide-react";

export default function Inquiries() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Inquiries
                </h1>

                <p className="mt-2 text-gray-500">
                    Contact the sports facility administration.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                <MessageSquare
                    size={45}
                    className="mx-auto text-gray-300"
                />

                <h2 className="mt-5 text-xl font-semibold">
                    No inquiries yet
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Your inquiries will appear here.
                </p>
            </div>
        </div>
    );
}