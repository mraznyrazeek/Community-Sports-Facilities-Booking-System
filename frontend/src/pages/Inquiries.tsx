import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createInquiry,
  getMyInquiries,
  getMyInquiry,
  getCurrentMember,
  sendInquiryReply,
} from "../services/api";


// ============================================================
// TYPES
// ============================================================

interface InquiryResponse {
  responseId: number;
  inquiryId: number;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface Inquiry {
  inquiryId: number;
  memberId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  adminResponse?: string | null;
  respondedAt?: string | null;
  responses?: InquiryResponse[];
}


// ============================================================
// STATUS HELPERS
// ============================================================

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock size={14} />,
      };

    case "in progress":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <RefreshCw size={14} />,
      };

    case "resolved":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 size={14} />,
      };

    default:
      return {
        badge: "bg-slate-50 text-slate-600 border-slate-200",
        icon: <AlertCircle size={14} />,
      };
  }
};


const formatDate = (date: string) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


const formatDateTime = (date: string) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};


// ============================================================
// COMPONENT
// ============================================================

export default function Inquiries() {
  const member = getCurrentMember();

  const isLoggedInMember =
    !!localStorage.getItem("token") &&
    member?.role?.toLowerCase() === "member";


  // ============================================================
  // STATE
  // ============================================================

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] =
    useState<Inquiry | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingInquiry, setLoadingInquiry] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [reply, setReply] = useState("");

  const [showNewInquiry, setShowNewInquiry] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadInquiries = async () => {
    if (!isLoggedInMember) return;

    try {
      setLoading(true);
      setError("");

      const data = await getMyInquiries();

      const inquiryList = Array.isArray(data)
        ? data
        : [];

      setInquiries(inquiryList);

      // Keep currently selected inquiry updated
      if (selectedInquiry) {
        const updatedSelected = inquiryList.find(
          (item: Inquiry) =>
            item.inquiryId === selectedInquiry.inquiryId
        );

        if (updatedSelected) {
          setSelectedInquiry(updatedSelected);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your inquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [isLoggedInMember]);


  const openInquiry = async (id: number) => {
    try {
      setLoadingInquiry(true);
      setError("");

      const data = await getMyInquiry(id);

      setSelectedInquiry(data);
      setShowNewInquiry(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this inquiry."
      );
    } finally {
      setLoadingInquiry(false);
    }
  };


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!subject.trim()) {
      setError("Please enter an inquiry subject.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your message.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const created = await createInquiry({
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubject("");
      setMessage("");

      setShowSuccessModal(true);
      setSuccess("Your inquiry has been sent successfully.");

      await loadInquiries();

      if (created?.inquiryId) {
        await openInquiry(created.inquiryId);
      }

      setShowNewInquiry(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your inquiry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedInquiry) return;

    if (!reply.trim()) {
      setError("Please enter a reply message.");
      return;
    }

    try {
      setSendingReply(true);
      setError("");

      await sendInquiryReply(
        selectedInquiry.inquiryId,
        reply.trim()
      );

      setReply("");

      // Reload the conversation
      const updatedInquiry = await getMyInquiry(
        selectedInquiry.inquiryId
      );

      setSelectedInquiry(updatedInquiry);

      // Refresh inquiry list/status
      const updatedList = await getMyInquiries();
      setInquiries(
        Array.isArray(updatedList)
          ? updatedList
          : []
      );

      setSuccess("Your reply has been sent.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your reply."
      );
    } finally {
      setSendingReply(false);
    }
  };


  const conversation = useMemo(() => {
    if (!selectedInquiry) return [];

    const messages: Array<{
      id: string;
      sender: "member" | "admin";
      message: string;
      createdAt: string;
    }> = [];

    // Original inquiry message
    messages.push({
      id: `inquiry-${selectedInquiry.inquiryId}`,
      sender: "member",
      message: selectedInquiry.message,
      createdAt: selectedInquiry.createdAt,
    });

    // Normal conversation responses
    if (
      selectedInquiry.responses &&
      selectedInquiry.responses.length > 0
    ) {
      selectedInquiry.responses.forEach((response) => {
        messages.push({
          id: `response-${response.responseId}`,
          sender:
            response.senderRole?.toLowerCase() === "admin"
              ? "admin"
              : "member",
          message: response.message,
          createdAt: response.createdAt,
        });
      });
    }

    // Fallback for existing single admin response
    // if there are no InquiryResponse records.
    if (
      (!selectedInquiry.responses ||
        selectedInquiry.responses.length === 0) &&
      selectedInquiry.adminResponse
    ) {
      messages.push({
        id: `admin-response-${selectedInquiry.inquiryId}`,
        sender: "admin",
        message: selectedInquiry.adminResponse,
        createdAt:
          selectedInquiry.respondedAt ||
          selectedInquiry.createdAt,
      });
    }

    return messages;
  }, [selectedInquiry]);

 if (!isLoggedInMember) {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <HelpCircle size={32} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Member Support
                    </h1>

                    <p className="mt-3 text-slate-500">
                        Please sign in to send an inquiry and view your
                        conversations with our support team.
                    </p>

                    <a
                        href="/login"
                        className="mt-7 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Sign In
                    </a>

                </div>
            </main>
        </div>
    );
}


  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How can we help?
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Send us an inquiry or continue a conversation with
              our support team.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowNewInquiry(true);
              setSelectedInquiry(null);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={19} />
            New Inquiry
          </button>
        </div>


        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        )}


        {success && !showSuccessModal && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}


        {/* CONTENT */}

        <div className="grid min-h-[650px] grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]">


          <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    My Inquiries
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {inquiries.length}{" "}
                    {inquiries.length === 1
                      ? "inquiry"
                      : "inquiries"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadInquiries}
                  disabled={loading}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
                  title="Refresh inquiries"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>


            {/* Inquiry list */}
            <div className="max-h-[600px] overflow-y-auto">
              {loading && inquiries.length === 0 ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="h-4 w-3/4 rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
                      <div className="mt-4 h-5 w-20 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : inquiries.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                    <MessageCircle size={27} />
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    No inquiries yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Have a question or need help?
                    Send your first inquiry and
                    our team will get back to you.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNewInquiry(true);
                      setSelectedInquiry(null);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Send Inquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {inquiries.map((inquiry) => {
                    const status =
                      getStatusStyles(
                        inquiry.status
                      );

                    const isSelected =
                      selectedInquiry?.inquiryId ===
                      inquiry.inquiryId;

                    const hasResponse =
                      inquiry.responses &&
                      inquiry.responses.length > 0;

                    return (
                      <button
                        key={inquiry.inquiryId}
                        type="button"
                        onClick={() =>
                          openInquiry(
                            inquiry.inquiryId
                          )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-blue-200 bg-blue-50"
                            : "border-transparent bg-white hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-1 flex-1 font-semibold text-slate-900">
                            {inquiry.subject}
                          </h3>

                          {hasResponse && (
                            <span
                              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                              title="New response"
                            />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {inquiry.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}
                          >
                            {status.icon}
                            {inquiry.status}
                          </span>

                          <span className="text-xs text-slate-400">
                            {formatDate(
                              inquiry.createdAt
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>


          <section className="flex min-h-[650px] flex-col bg-white">

            {/* NEW INQUIRY FORM */}

            {showNewInquiry ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Send a New Inquiry
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tell us what you need help with.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewInquiry(false)
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>


                <form
                  onSubmit={handleSubmit}
                  className="flex flex-1 flex-col"
                >
                  <div className="flex-1 space-y-6 px-6 py-7 sm:px-8">

                    {/* Member information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Name
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <User
                            size={17}
                            className="text-slate-400"
                          />

                          {member?.name ||
                            "Your account name"}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Email
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <Mail
                            size={17}
                            className="text-slate-400"
                          />

                          {member?.email ||
                            "Your account email"}
                        </div>
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
                        type="text"
                        value={subject}
                        onChange={(event) =>
                          setSubject(
                            event.target.value
                          )
                        }
                        placeholder="What can we help you with?"
                        maxLength={200}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>


                    {/* Message */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="message"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Message
                        </label>

                        <span className="text-xs text-slate-400">
                          {message.length}/1000
                        </span>
                      </div>

                      <textarea
                        id="message"
                        value={message}
                        onChange={(event) =>
                          setMessage(
                            event.target.value
                          )
                        }
                        placeholder="Please describe your question or issue..."
                        maxLength={1000}
                        rows={8}
                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>


                    {/* Info box */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex gap-3">
                        <HelpCircle
                          size={19}
                          className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            What happens next?
                          </p>

                          <p className="mt-1 text-sm leading-6 text-blue-700">
                            Your inquiry will be sent to our
                            support team. You can return here
                            at any time to view their response
                            and continue the conversation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Submit */}
                  <div className="border-t border-slate-200 px-6 py-5 sm:px-8">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : selectedInquiry ? (

              <>
                {/* Conversation header */}
                <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedInquiry.subject}
                        </h2>

                        {(() => {
                          const status =
                            getStatusStyles(
                              selectedInquiry.status
                            );

                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}
                            >
                              {status.icon}
                              {selectedInquiry.status}
                            </span>
                          );
                        })()}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Inquiry #
                        {selectedInquiry.inquiryId}
                        {" · "}
                        {formatDate(
                          selectedInquiry.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openInquiry(
                          selectedInquiry.inquiryId
                        )
                      }
                      disabled={loadingInquiry}
                      className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                      title="Refresh conversation"
                    >
                      <RefreshCw
                        size={18}
                        className={
                          loadingInquiry
                            ? "animate-spin"
                            : ""
                        }
                      />
                    </button>
                  </div>
                </div>


                {/* Conversation messages */}
                <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/60 px-5 py-7 sm:px-8">

                  {conversation.map((item) => {
                    const isMember =
                      item.sender === "member";

                    return (
                      <div
                        key={item.id}
                        className={`flex ${
                          isMember
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] ${
                            isMember
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          <div
                            className={`mb-1.5 flex items-center gap-2 text-xs font-semibold ${
                              isMember
                                ? "justify-end text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            {!isMember && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <MessageCircle
                                  size={13}
                                />
                              </div>
                            )}

                            <span>
                              {isMember
                                ? "You"
                                : "Support Team"}
                            </span>

                            <span className="font-normal text-slate-400">
                              {formatDateTime(
                                item.createdAt
                              )}
                            </span>
                          </div>

                          <div
                            className={`rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-sm ${
                              isMember
                                ? "rounded-tr-md bg-blue-600 text-white"
                                : "rounded-tl-md border border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {item.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}


                  {conversation.length === 1 && (
                    <div className="py-3 text-center">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500">
                        <Clock size={14} />
                        Waiting for a response from
                        our support team
                      </span>
                    </div>
                  )}
                </div>


                {/* Reply area */}
                {selectedInquiry.status?.toLowerCase() ===
                "resolved" ? (
                  <div className="border-t border-slate-200 bg-white px-6 py-5 sm:px-8">
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                      <CheckCircle2 size={18} />
                      This inquiry has been resolved.
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowNewInquiry(true);
                        setSelectedInquiry(null);
                      }}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Create a New Inquiry
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReply}
                    className="border-t border-slate-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-end gap-3">
                      <textarea
                        value={reply}
                        onChange={(event) =>
                          setReply(
                            event.target.value
                          )
                        }
                        placeholder="Write a reply..."
                        maxLength={1000}
                        rows={2}
                        className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />

                      <button
                        type="submit"
                        disabled={
                          sendingReply ||
                          !reply.trim()
                        }
                        className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sendingReply ? (
                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Send size={18} />
                        )}

                        <span className="hidden sm:inline">
                          Send
                        </span>
                      </button>
                    </div>

                    <p className="mt-2 px-1 text-xs text-slate-400">
                      Press the Send button to reply to
                      this conversation.
                    </p>
                  </form>
                )}
              </>
            ) : (

              /* EMPTY STATE */

              <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <MessageCircle size={36} />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    Your Support Center
                  </h2>

                  <p className="mt-3 leading-7 text-slate-500">
                    Select an inquiry from the left to view
                    your conversation, or create a new inquiry
                    if you need help.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewInquiry(true)
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Send an Inquiry
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>


      {/* SUCCESS MODAL */}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={34} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Inquiry Sent!
            </h3>

            <p className="mt-3 leading-6 text-slate-500">
              Your inquiry has been successfully sent to our
              support team. You can track the response from
              your My Inquiries section.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setSuccess("");
              }}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}