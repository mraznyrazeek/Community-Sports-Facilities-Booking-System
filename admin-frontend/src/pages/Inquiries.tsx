import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import {
  getInquiries,
  getInquiryResponses,
  createInquiryResponse,
  updateInquiry,
  deleteInquiry,
  type Inquiry,
  type InquiryResponse,
} from "../services/api";

const ITEMS_PER_PAGE = 10;

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedInquiry, setSelectedInquiry] =
    useState<Inquiry | null>(null);

  const [responses, setResponses] =
    useState<InquiryResponse[]>([]);

  const [responsesLoading, setResponsesLoading] =
    useState(false);

  const [replyMessage, setReplyMessage] =
    useState("");

  const [sendingReply, setSendingReply] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] =
    useState<number | null>(null);

  // ------------------------------------------
  // Load inquiries
  // ------------------------------------------

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInquiries();

      setInquiries(data);
    } catch (err) {
      console.error(
        "Failed to load inquiries:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load inquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // ------------------------------------------
  // Reset pagination when search/filter changes
  // ------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ------------------------------------------
  // Load responses for selected inquiry
  // ------------------------------------------

  const loadResponses = async (
    inquiryId: number
  ) => {
    try {
      setResponsesLoading(true);

      const data =
        await getInquiryResponses(inquiryId);

      setResponses(data);
    } catch (err) {
      console.error(
        "Failed to load inquiry responses:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to load inquiry responses."
      );
    } finally {
      setResponsesLoading(false);
    }
  };

  // ------------------------------------------
  // Open inquiry
  // ------------------------------------------

  const handleViewInquiry = async (
    inquiry: Inquiry
  ) => {
    setSelectedInquiry(inquiry);
    setResponses([]);
    setReplyMessage("");

    await loadResponses(inquiry.inquiryId);
  };

  // ------------------------------------------
  // Statistics
  // ------------------------------------------

  const totalInquiries = inquiries.length;

  const pendingInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.status.toLowerCase() === "pending"
  ).length;

  const resolvedInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.status.toLowerCase() === "resolved"
  ).length;

  // ------------------------------------------
  // Search + filter
  // ------------------------------------------

  const filteredInquiries = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const matchesSearch =
        !searchValue ||
        inquiry.name
          .toLowerCase()
          .includes(searchValue) ||
        inquiry.email
          .toLowerCase()
          .includes(searchValue) ||
        inquiry.subject
          .toLowerCase()
          .includes(searchValue) ||
        inquiry.message
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        inquiry.status.toLowerCase() ===
        statusFilter.toLowerCase();

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    inquiries,
    search,
    statusFilter,
  ]);

  // ------------------------------------------
  // Pagination calculations
  // ------------------------------------------

  const totalPages = Math.ceil(
    filteredInquiries.length /
    ITEMS_PER_PAGE
  );

  const paginatedInquiries = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    const endIndex =
      startIndex + ITEMS_PER_PAGE;

    return filteredInquiries.slice(
      startIndex,
      endIndex
    );
  }, [
    filteredInquiries,
    currentPage,
  ]);

  // ------------------------------------------
  // Make sure current page is valid
  // ------------------------------------------

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ------------------------------------------
  // Update status
  // ------------------------------------------

  const handleStatusChange = async (
    inquiry: Inquiry,
    newStatus:
      | "Pending"
      | "In Progress"
      | "Resolved"
  ) => {
    try {
      setSaving(true);

      await updateInquiry(
        inquiry.inquiryId,
        {
          subject: inquiry.subject,
          message: inquiry.message,
          status: newStatus,
        }
      );

      const updatedInquiry: Inquiry = {
        ...inquiry,
        status: newStatus,
      };

      setInquiries((current) =>
        current.map((item) =>
          item.inquiryId ===
            inquiry.inquiryId
            ? updatedInquiry
            : item
        )
      );

      setSelectedInquiry(
        updatedInquiry
      );
    } catch (err) {
      console.error(
        "Failed to update inquiry:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update inquiry."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------
  // Send response
  // ------------------------------------------

  const handleSendReply = async () => {
    if (!selectedInquiry) {
      return;
    }

    const message = replyMessage.trim();

    if (!message) {
      return;
    }

    try {
      setSendingReply(true);

      await createInquiryResponse(
        selectedInquiry.inquiryId,
        message
      );

      setReplyMessage("");

      // Reload conversation
      await loadResponses(
        selectedInquiry.inquiryId
      );

      // Automatically move Pending → In Progress
      if (
        selectedInquiry.status === "Pending"
      ) {
        await updateInquiry(
          selectedInquiry.inquiryId,
          {
            subject:
              selectedInquiry.subject,
            message:
              selectedInquiry.message,
            status: "In Progress",
          }
        );

        const updatedInquiry: Inquiry = {
          ...selectedInquiry,
          status: "In Progress",
        };

        setSelectedInquiry(
          updatedInquiry
        );

        setInquiries((current) =>
          current.map((item) =>
            item.inquiryId ===
              selectedInquiry.inquiryId
              ? updatedInquiry
              : item
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to send response:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to send response."
      );
    } finally {
      setSendingReply(false);
    }
  };

  // ------------------------------------------
  // Delete inquiry
  // ------------------------------------------

  const handleDelete = async (
    inquiryId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inquiry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(inquiryId);

      await deleteInquiry(inquiryId);

      setInquiries((current) =>
        current.filter(
          (item) =>
            item.inquiryId !== inquiryId
        )
      );

      if (
        selectedInquiry?.inquiryId ===
        inquiryId
      ) {
        setSelectedInquiry(null);
        setResponses([]);
      }
    } catch (err) {
      console.error(
        "Failed to delete inquiry:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete inquiry."
      );
    } finally {
      setDeleting(null);
    }
  };

  // ------------------------------------------
  // Status badge
  // ------------------------------------------

  const getStatusClass = (
    status: string
  ) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";

      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "in progress":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ------------------------------------------
  // Loading
  // ------------------------------------------

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // Pagination display numbers
  // ------------------------------------------

  const pageNumbers = [];

  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
    pageNumbers.push(page);
  }

  // ------------------------------------------
  // Display range
  // ------------------------------------------

  const startItem =
    filteredInquiries.length === 0
      ? 0
      : (currentPage - 1) *
      ITEMS_PER_PAGE +
      1;

  const endItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredInquiries.length
  );

  return (
    <div>

      <div>
        <p className="text-sm font-medium text-blue-600">
          Queries & Messages
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Inquiries
        </h1>

        <p className="mt-2 text-base text-slate-500">
          Manage messages and inquiries from the public.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Inquiries
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalInquiries}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Messages received
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <MessageSquare
                size={24}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Pending */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pendingInquiries}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Awaiting response
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
              <Clock
                size={24}
                className="text-yellow-600"
              />
            </div>
          </div>
        </div>

        {/* Resolved */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {resolvedInquiries}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Completed inquiries
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle
                size={24}
                className="text-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Top bar */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Public Inquiries
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage messages submitted
              through the website.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>
            </select>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <MessageSquare
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No inquiries found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search ||
                statusFilter !== "All"
                ? "Try changing your search or filter."
                : "There are currently no inquiries."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {paginatedInquiries.map(
              (inquiry) => (
                <div
                  key={inquiry.inquiryId}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Left */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {inquiry.subject}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                            inquiry.status
                          )}`}
                        >
                          {inquiry.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

                        <span className="font-medium text-slate-700">
                          {inquiry.name}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Mail size={15} />
                          {inquiry.email}
                        </span>

                        <span>
                          {new Date(
                            inquiry.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {inquiry.message}
                      </p>
                    </div>

                    {/* Actions */}

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleViewInquiry(
                            inquiry
                          )
                        }
                        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye size={17} />
                        View
                      </button>

                      <button
                        type="button"
                        disabled={
                          deleting ===
                          inquiry.inquiryId
                        }
                        onClick={() =>
                          handleDelete(
                            inquiry.inquiryId
                          )
                        }
                        className="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={17} />

                        {deleting ===
                          inquiry.inquiryId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {filteredInquiries.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Result count */}

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {startItem}
              </span>
              –
              <span className="font-medium text-slate-700">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {filteredInquiries.length}
              </span>{" "}
              inquiries
            </p>

            {/* Pagination */}

            {totalPages > 1 && (
              <div className="flex items-center gap-1">

                {/* Previous */}

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        page - 1
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {/* Page numbers */}

                {pageNumbers.map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        page + 1
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Inquiry Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Inquiry #
                  {selectedInquiry.inquiryId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedInquiry(null);
                  setResponses([]);
                  setReplyMessage("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Modal Content */}

            <div className="flex-1 overflow-y-auto">

              <div className="space-y-6 p-6">

                {/* Sender information */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedInquiry.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedInquiry.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {new Date(
                        selectedInquiry.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <select
                      value={
                        selectedInquiry.status
                      }
                      disabled={saving}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedInquiry,
                          e.target.value as
                          | "Pending"
                          | "In Progress"
                          | "Resolved"
                        )
                      }
                      className="mt-1 h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>
                    </select>
                  </div>
                </div>

                {/* Subject */}

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Subject
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedInquiry.subject}
                  </p>
                </div>

                {/* Conversation */}

                <div>

                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquare
                      size={18}
                      className="text-blue-600"
                    />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Conversation
                    </h3>
                  </div>

                  <div className="space-y-4">

                    {/* Original member message */}

                    <div className="flex justify-start">
                      <div className="max-w-[85%]">

                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700">
                            {selectedInquiry.name}
                          </span>

                          <span className="text-xs text-slate-400">
                            Member
                          </span>
                        </div>

                        <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {selectedInquiry.message}
                          </p>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            selectedInquiry.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Responses */}

                    {responsesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                      </div>
                    ) : responses.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                        <MessageSquare
                          size={22}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-sm text-slate-500">
                          No replies yet.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Send a response below to
                          start the conversation.
                        </p>
                      </div>
                    ) : (
                      responses.map(
                        (response) => {
                          const isAdmin =
                            response.senderRole ===
                            "Admin";

                          return (
                            <div
                              key={
                                response.responseId
                              }
                              className={`flex ${isAdmin
                                  ? "justify-end"
                                  : "justify-start"
                                }`}
                            >
                              <div className="max-w-[85%]">

                                <div
                                  className={`mb-1 flex items-center gap-2 ${isAdmin
                                      ? "justify-end"
                                      : ""
                                    }`}
                                >
                                  <span className="text-xs font-semibold text-slate-700">
                                    {isAdmin
                                      ? "Admin"
                                      : selectedInquiry.name}
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    {isAdmin
                                      ? "Staff"
                                      : "Member"}
                                  </span>
                                </div>

                                <div
                                  className={`rounded-2xl px-4 py-3 ${isAdmin
                                      ? "rounded-tr-md bg-blue-600 text-white"
                                      : "rounded-tl-md bg-slate-100 text-slate-700"
                                    }`}
                                >
                                  <p className="whitespace-pre-wrap text-sm leading-6">
                                    {
                                      response.message
                                    }
                                  </p>
                                </div>

                                <p
                                  className={`mt-1 text-xs text-slate-400 ${isAdmin
                                      ? "text-right"
                                      : ""
                                    }`}
                                >
                                  {new Date(
                                    response.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )
                    )}
                  </div>
                </div>

                {/* Reply */}

                <div className="border-t border-slate-200 pt-6">

                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Reply to Inquiry
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Your response will be visible
                      to the member.
                    </p>
                  </div>

                  <textarea
                    value={replyMessage}
                    onChange={(e) =>
                      setReplyMessage(
                        e.target.value
                      )
                    }
                    placeholder="Type your response here..."
                    rows={5}
                    disabled={sendingReply}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />

                  <div className="mt-3 flex items-center justify-between">

                    <p className="text-xs text-slate-400">
                      {replyMessage.length > 0
                        ? `${replyMessage.length} characters`
                        : "Enter a response"}
                    </p>

                    <button
                      type="button"
                      disabled={
                        sendingReply ||
                        !replyMessage.trim()
                      }
                      onClick={
                        handleSendReply
                      }
                      className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={16} />

                      {sendingReply
                        ? "Sending..."
                        : "Send Response"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex shrink-0 justify-between border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedInquiry.inquiryId
                  )
                }
                disabled={
                  deleting ===
                  selectedInquiry.inquiryId
                }
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={17} />

                {deleting ===
                  selectedInquiry.inquiryId
                  ? "Deleting..."
                  : "Delete Inquiry"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedInquiry(null);
                  setResponses([]);
                  setReplyMessage("");
                }}
                className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}