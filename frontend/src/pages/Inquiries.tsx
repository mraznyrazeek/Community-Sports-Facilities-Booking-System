import {
    HelpCircle,
    Mail,
    MessageSquare,
    Send,
} from "lucide-react";
import { FormEvent, useState } from "react";

export default function Inquiries() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitted(true);

        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                    <div className="max-w-2xl">

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <MessageSquare size={24} />
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            How can we help?
                        </h1>

                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Have a question about our sports programs,
                            facilities, bookings, or membership?
                            Send us an inquiry and our team will get
                            back to you.
                        </p>

                    </div>

                </div>
            </section>


            {/* =====================================================
                CONTENT
            ====================================================== */}

            <section className="py-10 sm:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="grid gap-8 lg:grid-cols-3">

                        {/* =================================================
                            INFORMATION CARD
                        ================================================== */}

                        <div className="space-y-5">

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <HelpCircle size={22} />
                                </div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    General Support
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Ask us anything about community
                                    sports, membership, facilities,
                                    or bookings.
                                </p>

                            </div>


                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Mail size={22} />
                                </div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    Contact Support
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Our community support team is
                                    available to help with your
                                    questions.
                                </p>

                                <div className="mt-4 text-sm font-medium text-slate-900">
                                    support@sportshub.com
                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            INQUIRY FORM
                        ================================================== */}

                        <div className="lg:col-span-2">

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                                <div className="mb-7">

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Send an Inquiry
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Fill in the form below and
                                        provide as much detail as
                                        possible.
                                    </p>

                                </div>


                                {/* Success Message */}

                                {submitted && (
                                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                                        <p className="text-sm font-semibold text-emerald-800">
                                            Your inquiry has been
                                            submitted successfully.
                                        </p>

                                        <p className="mt-1 text-sm text-emerald-700">
                                            Our team will review your
                                            message and get back to you.
                                        </p>

                                    </div>
                                )}


                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >

                                    {/* Name + Email */}

                                    <div className="grid gap-6 sm:grid-cols-2">

                                        <div>

                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Full Name
                                            </label>

                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your name"
                                                required
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                            />

                                        </div>


                                        <div>

                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Email Address
                                            </label>

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                required
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* Subject */}

                                    <div>

                                        <label
                                            htmlFor="subject"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Subject
                                        </label>

                                        <input
                                            id="subject"
                                            name="subject"
                                            type="text"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="What would you like to ask?"
                                            required
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Message */}

                                    <div>

                                        <label
                                            htmlFor="message"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Message
                                        </label>

                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={7}
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Write your inquiry here..."
                                            required
                                            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Submit */}

                                    <div className="flex justify-end">

                                        <button
                                            type="submit"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-auto"
                                        >
                                            <Send size={17} />

                                            Send Inquiry
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

        </div>
    );
}