const API_BASE_URL = "https://localhost:7252/api";

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ============================================================
// GENERIC API REQUEST
// ============================================================

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the API. Make sure the backend is running."
    );
  }

  // ----------------------------------------------------------
  // No Content
  // ----------------------------------------------------------

  if (response.status === 204) {
    return null;
  }

  // ----------------------------------------------------------
  // Read Response
  // ----------------------------------------------------------

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ----------------------------------------------------------
  // Unauthorized
  // ----------------------------------------------------------

  if (response.status === 401) {
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("member");
    }

    const message =
      typeof data === "string"
        ? data
        : data?.message || "Your session has expired. Please log in again.";

    throw new Error(message);
  }

  // ----------------------------------------------------------
  // Forbidden
  // ----------------------------------------------------------

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }

  // ----------------------------------------------------------
  // Conflict
  // ----------------------------------------------------------

  if (response.status === 409) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.title ||
          "This action conflicts with existing data.";

    throw new Error(message);
  }

  // ----------------------------------------------------------
  // Other Errors
  // ----------------------------------------------------------

  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors) {
      message = "Please check the information you entered.";
    }

    throw new Error(message);
  }

  return data;
};

// ============================================================
// AUTHENTICATION
// ============================================================

export const register = async (userData) => {
  return request("/Auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const login = async (credentials) => {
  const data = await request("/Auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  if (data?.member) {
    localStorage.setItem(
      "member",
      JSON.stringify(data.member)
    );
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("member");
};

export const getCurrentMember = () => {
  const member = localStorage.getItem("member");

  try {
    return member ? JSON.parse(member) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// ============================================================
// SPORTS
// ============================================================

export const getSports = () => {
  return request("/Sports");
};

export const getSport = (id) => {
  return request(`/Sports/${id}`);
};

export const createSport = (sport) => {
  return request("/Sports", {
    method: "POST",
    body: JSON.stringify(sport),
  });
};

export const updateSport = (id, sport) => {
  return request(`/Sports/${id}`, {
    method: "PUT",
    body: JSON.stringify(sport),
  });
};

export const deleteSport = (id) => {
  return request(`/Sports/${id}`, {
    method: "DELETE",
  });
};

// ============================================================
// MEMBER SPORTS
// ============================================================

// Get sports registered by the currently logged-in member
export const getMySports = () => {
  return request("/MemberSports");
};

// Register current member for a sport
export const registerForSport = (sportId) => {
  return request("/MemberSports", {
    method: "POST",
    body: JSON.stringify({
      sportId: sportId,
    }),
  });
};

// Remove current member from a registered sport
export const removeMySport = (sportId) => {
  return request(`/MemberSports/${sportId}`, {
    method: "DELETE",
  });
};

// ============================================================
// FACILITIES
// ============================================================

export const getFacilities = () => {
  return request("/Facilities");
};

export const getFacility = (id) => {
  return request(`/Facilities/${id}`);
};

export const createFacility = (facility) => {
  return request("/Facilities", {
    method: "POST",
    body: JSON.stringify(facility),
  });
};

export const updateFacility = (id, facility) => {
  return request(`/Facilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(facility),
  });
};

export const deleteFacility = (id) => {
  return request(`/Facilities/${id}`, {
    method: "DELETE",
  });
};

// ============================================================
// BOOKINGS
// ============================================================

export const getBookings = () => {
  return request("/Bookings");
};

export const getBooking = (id) => {
  return request(`/Bookings/${id}`);
};

export const createBooking = (booking) => {
  return request("/Bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
};

export const updateBooking = (id, booking) => {
  return request(`/Bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(booking),
  });
};

export const confirmBooking = (id) => {
  return request(`/Bookings/${id}/confirm`, {
    method: "PUT",
  });
};

export const cancelBooking = (id) => {
  return request(`/Bookings/${id}/cancel`, {
    method: "PUT",
  });
};

export const deleteBooking = (id) => {
  return request(`/Bookings/${id}`, {
    method: "DELETE",
  });
};

export const getBookingAvailability = (
  facilityId,
  date
) => {
  return request(
    `/Bookings/availability?facilityId=${facilityId}&date=${encodeURIComponent(
      date
    )}`
  );
};

export const getMyBookings = () => {
  return request("/Bookings/member/my");
};

export const getFacilityBookings = (facilityId) => {
  return request(`/Bookings/facility/${facilityId}`);
};

// =====================================================
// REVIEWS
// =====================================================

// Get ALL reviews.
// Public - guests and logged-in members can view reviews.
export const getReviews = () => {
  return request("/Reviews");
};


// Get all bookings belonging to the logged-in member
// that can be displayed in the Review section.
export const getReviewableBookings = () => {
  return request("/Reviews/member/reviewable");
};


// Get reviews submitted by the logged-in member.
export const getMyReviews = () => {
  return request("/Reviews/member/my");
};


// Get a single review by ID.
export const getReview = (id) => {
  return request(`/Reviews/${id}`);
};


// Create a new review.
export const createReview = (reviewData) => {
  return request("/Reviews", {
    method: "POST",
    body: JSON.stringify({
      facilityId: reviewData.facilityId,
      rating: reviewData.rating,
      commentText: reviewData.commentText,
    }),
  });
};


// Update an existing review.
export const updateReview = (id, reviewData) => {
  return request(`/Reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      rating: reviewData.rating,
      commentText: reviewData.commentText,
    }),
  });
};


// Get reviews for a specific facility.
export const getFacilityReviews = (facilityId) => {
  return request(`/Reviews/facility/${facilityId}`);
};


// Delete an existing review.
export const deleteReview = (id) => {
  return request(`/Reviews/${id}`, {
    method: "DELETE",
  });
};

// ============================================================
// MEMBERS
// ============================================================

// Admin-side member access

export const getMember = (id) => {
  return request(`/Members/${id}`);
};

export const updateMember = (id, member) => {
  return request(`/Members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member),
  });
};

export const deleteMember = (id) => {
  return request(`/Members/${id}`, {
    method: "DELETE",
  });
};

// ============================================================
// CURRENT MEMBER ACCOUNT
// ============================================================

export const updateMyProfile = (profile) => {
  return request("/Auth/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
};

export const changeMyPassword = (passwordData) => {
  return request("/Auth/member/change-password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
};

export const deactivateMyAccount = () => {
  return request("/Auth/deactivate-account", {
    method: "PUT",
  });
};

export const reactivateAccount = (credentials) => {
  return request("/Auth/reactivate", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// ============================================================
// INQUIRIES - MEMBER SIDE
// ============================================================

export const getMyInquiries = () => {
  return request("/Inquiries");
};

export const getMyInquiry = (id) => {
  return request(`/Inquiries/${id}`);
};

export const createInquiry = (data) => {
  return request("/Inquiries", {
    method: "POST",
    body: JSON.stringify({
      subject: data.subject,
      message: data.message,
    }),
  });
};

export const sendInquiryReply = (inquiryId, message) => {
  return request(`/Inquiries/${inquiryId}/Responses`, {
    method: "POST",
    body: JSON.stringify({
      message: message,
    }),
  });
};


export const updateMyInquiry = (id, data) => {
  return request(`/Inquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      subject: data.subject,
      message: data.message,
    }),
  });
};


// Delete an inquiry
export const deleteMyInquiry = (id) => {
  return request(`/Inquiries/${id}`, {
    method: "DELETE",
  });
};

// ============================================================
// NOTIFICATIONS
// ============================================================

// Get all notifications for the logged-in member
export const getMyNotifications = async () => {
  return request("/Notifications");
};


// Get unread notification count
export const getUnreadNotificationCount = async () => {
  return request("/Notifications/unread-count");
};


// Mark one notification as read
export const markNotificationAsRead = async (id) => {
  return request(`/Notifications/${id}/read`, {
    method: "PUT",
  });
};


// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  return request("/Notifications/read-all", {
    method: "PUT",
  });
};


// Delete one notification
export const deleteNotification = async (id) => {
  return request(`/Notifications/${id}`, {
    method: "DELETE",
  });
};

// Check completed bookings and create Review Available
// notifications for facilities that have not been reviewed.
export const syncReviewNotifications = async () => {
  return request("/Notifications/sync-review-notifications", {
    method: "POST",
  });
};


// ============================================================
// GENERAL API ACCESS
// ============================================================

export const apiRequest = request;