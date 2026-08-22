import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner({ text = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-gray-500">
                {text}
            </p>
        </div>
    );
}