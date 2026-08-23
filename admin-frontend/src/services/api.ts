const API_BASE_URL = "https://localhost:7252/api";

export type Member = {
  memberId: number;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  createdAt: string;
  userRole?: string;
};

export type Sport = {
  sportId: number;
  sportName: string;
  description?: string | null;
};

export type Facility = {
  facilityId: number;
  sportId: number;
  facilityName: string;
  description?: string | null;
  location: string;
  address?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  status: string;
  sport?: Sport | null;
};

export type Booking = {
  bookingId: number;
  memberId: number;
  facilityId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  member?: {
    memberId: number;
    name: string;
    email: string;
  } | null;
  facility?: {
    facilityId: number;
    facilityName: string;
    location: string;
  } | null;
};

export type Review = {
  reviewId: number;
  memberId: number;
  facilityId: number;
  rating: number;
  commentText?: string | null;
  createdAt: string;
  member?: {
    memberId: number;
    name: string;
    email: string;
  } | null;
  facility?: {
    facilityId: number;
    facilityName: string;
  } | null;
};

export type Inquiry = {
  inquiryId: number;
  memberId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  member: Member & {
    role?: string;
    userRole?: string;
  };
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("adminToken");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminMember");
    window.location.href = "/login";
    throw new Error("Your session has expired.");
  }

  const contentType = response.headers.get("content-type") || "";

  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    if (text) {
      data = text;
    }
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors) {
      message = Object.values(data.errors)
        .flat()
        .join(" ");
    }

    throw new Error(message);
  }

  return data as T;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/Auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  localStorage.setItem("adminToken", data.token);
  localStorage.setItem(
    "adminMember",
    JSON.stringify(data.member)
  );

  return data;
}

export function logout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminMember");
  window.location.href = "/login";
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("adminToken"));
}

export function getAdminMember(): Member | null {
  const value = localStorage.getItem("adminMember");

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function getMembers() {
  return request<Member[]>("/Members");
}

export async function getMember(id: number) {
  return request<Member>(`/Members/${id}`);
}

export async function updateMember(
  id: number,
  member: Partial<Member> & {
    memberId: number;
  }
) {
  return request<void>(`/Members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member),
  });
}

export async function deleteMember(id: number) {
  return request<void>(`/Members/${id}`, {
    method: "DELETE",
  });
}

export async function getSports() {
  return request<Sport[]>("/Sports");
}

export async function getSport(id: number) {
  return request<Sport>(`/Sports/${id}`);
}

export async function createSport(data: {
  sportName: string;
  description?: string;
}) {
  return request<Sport>("/Sports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSport(
  id: number,
  data: Sport
) {
  return request<void>(`/Sports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSport(id: number) {
  return request<void>(`/Sports/${id}`, {
    method: "DELETE",
  });
}

export async function getFacilities() {
  return request<Facility[]>("/Facilities");
}

export async function getFacility(id: number) {
  return request<Facility>(`/Facilities/${id}`);
}

export async function createFacility(data: {
  sportId: number;
  facilityName: string;
  description?: string;
  location: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  status: string;
}) {
  return request<Facility>("/Facilities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFacility(
  id: number,
  data: Facility
) {
  return request<void>(`/Facilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFacility(id: number) {
  return request<void>(`/Facilities/${id}`, {
    method: "DELETE",
  });
}

export async function getBookings() {
  return request<Booking[]>("/Bookings");
}

export async function getBooking(id: number) {
  return request<Booking>(`/Bookings/${id}`);
}

export async function deleteBooking(id: number) {
  return request<void>(`/Bookings/${id}`, {
    method: "DELETE",
  });
}

export async function cancelBooking(id: number) {
  return request<void>(`/Bookings/${id}/cancel`, {
    method: "PUT",
  });
}

export async function getReviews() {
  return request<Review[]>("/Reviews");
}

export async function updateReview(
  id: number,
  data: Review
) {
  return request<void>(`/Reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: number) {
  return request<void>(`/Reviews/${id}`, {
    method: "DELETE",
  });
}

export async function getInquiries() {
  return request<Inquiry[]>("/Inquiries");
}

export async function getInquiry(id: number) {
  return request<Inquiry>(`/Inquiries/${id}`);
}

export async function updateInquiry(
  id: number,
  data: Inquiry
) {
  return request<void>(`/Inquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInquiry(id: number) {
  return request<void>(`/Inquiries/${id}`, {
    method: "DELETE",
  });
}