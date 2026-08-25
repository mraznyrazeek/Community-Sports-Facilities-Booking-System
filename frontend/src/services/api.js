// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL = "https://localhost:7252/api";


// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

// Get the JWT token stored after login
const getToken = () => {
  return localStorage.getItem("token");
};


// ============================================================
// GENERIC API REQUEST FUNCTION
// ============================================================

// This function is used by all API calls.
//
// It:
// 1. Adds the JWT token to requests
// 2. Sends requests to the backend
// 3. Handles common HTTP errors
// 4. Returns the API response
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add JWT token when the user is logged in
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the API. Make sure the backend is running."
    );
  }

  // ----------------------------------------------------------
  // 204 - No Content
  // ----------------------------------------------------------

  if (response.status === 204) {
    return null;
  }

  // ----------------------------------------------------------
  // Read response data
  // ----------------------------------------------------------

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ----------------------------------------------------------
  // 401 - Unauthorized
  // ----------------------------------------------------------

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("member");

    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  // ----------------------------------------------------------
  // 403 - Forbidden
  // ----------------------------------------------------------

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }

  // ----------------------------------------------------------
  // Other API errors
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

// Register a new member
export const register = async (userData) => {
  return request("/Auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};


// Login
//
// The backend returns:
// - JWT token
// - member information
//
// Both are stored in localStorage.
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


// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("member");
};


// Get the currently logged-in member
export const getCurrentMember = () => {
  const member = localStorage.getItem("member");

  try {
    return member ? JSON.parse(member) : null;
  } catch {
    return null;
  }
};


// Check whether the user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};


// ============================================================
// SPORTS
// ============================================================

// Get all sports
export const getSports = () => {
  return request("/Sports");
};


// Get one sport by ID
export const getSport = (id) => {
  return request(`/Sports/${id}`);
};


// Create a sport
//
// Used by the admin side when we need to add a sport.
export const createSport = (sport) => {
  return request("/Sports", {
    method: "POST",
    body: JSON.stringify(sport),
  });
};


// Update a sport
export const updateSport = (id, sport) => {
  return request(`/Sports/${id}`, {
    method: "PUT",
    body: JSON.stringify(sport),
  });
};


// Delete a sport
export const deleteSport = (id) => {
  return request(`/Sports/${id}`, {
    method: "DELETE",
  });
};

// ============================================================
// MEMBER SPORTS
// ============================================================

// Get sports registered by the currently logged-in member
//
// Backend:
// GET /api/MemberSports
//
// The backend identifies the member using the JWT token.
export const getMySports = () => {
  return request("/MemberSports");
};


// Register the currently logged-in member for a sport
//
// Backend:
// POST /api/MemberSports
//
// Frontend sends:
// {
//   sportId: 1
// }
export const registerForSport = (sportId) => {
  return request("/MemberSports", {
    method: "POST",
    body: JSON.stringify({
      sportId,
    }),
  });
};


// Remove the currently logged-in member from a sport
//
// Backend:
// DELETE /api/MemberSports/{sportId}
export const removeMySport = (sportId) => {
  return request(`/MemberSports/${sportId}`, {
    method: "DELETE",
  });
};


// ============================================================
// FACILITIES
// ============================================================

// Get all facilities
export const getFacilities = () => {
  return request("/Facilities");
};


// Get one facility by ID
export const getFacility = (id) => {
  return request(`/Facilities/${id}`);
};


// Create a facility
//
// Used by the admin side when we need to add a facility.
export const createFacility = (facility) => {
  return request("/Facilities", {
    method: "POST",
    body: JSON.stringify(facility),
  });
};


// Update a facility
export const updateFacility = (id, facility) => {
  return request(`/Facilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(facility),
  });
};


// Delete a facility
export const deleteFacility = (id) => {
  return request(`/Facilities/${id}`, {
    method: "DELETE",
  });
};


// ============================================================
// BOOKINGS
// ============================================================

// Get all bookings
//
// Backend:
// GET /api/Bookings
//
// This endpoint is Admin-only.
export const getBookings = () => {
  return request("/Bookings");
};


// Get one booking
//
// Backend:
// GET /api/Bookings/{id}
export const getBooking = (id) => {
  return request(`/Bookings/${id}`);
};


// Create a booking
//
// IMPORTANT:
// The frontend does NOT send:
// - bookingId
// - memberId
// - createdAt
// - status
//
// Those are handled by the backend/database.
//
// Frontend sends only booking information such as:
// {
//   facilityId,
//   bookingDate,
//   startTime,
//   endTime
// }
export const createBooking = (booking) => {
  return request("/Bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
};


// Update an existing booking
export const updateBooking = (id, booking) => {
  return request(`/Bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(booking),
  });
};


// Confirm a booking
//
// Backend:
// PUT /api/Bookings/{id}/confirm
//
// Admin-only.
export const confirmBooking = (id) => {
  return request(`/Bookings/${id}/confirm`, {
    method: "PUT",
  });
};


// Cancel a booking
//
// A member can cancel their own booking.
// Admin can cancel any booking.
export const cancelBooking = (id) => {
  return request(`/Bookings/${id}/cancel`, {
    method: "PUT",
  });
};


// Delete a booking
//
// A member can delete their own booking.
// Admin can delete any booking.
export const deleteBooking = (id) => {
  return request(`/Bookings/${id}`, {
    method: "DELETE",
  });
};


// Check facility availability for a specific date
//
// Example:
// getBookingAvailability(2, "2026-08-28")
//
// Backend:
// GET /api/Bookings/availability
export const getBookingAvailability = (facilityId, date) => {
  return request(
    `/Bookings/availability?facilityId=${facilityId}&date=${encodeURIComponent(date)}`
  );
};


// Get bookings belonging to the currently logged-in member
//
// Backend:
// GET /api/Bookings/member/my
export const getMyBookings = () => {
  return request("/Bookings/member/my");
};


// Get bookings for a specific facility
//
// Backend:
// GET /api/Bookings/facility/{facilityId}
export const getFacilityBookings = (facilityId) => {
  return request(`/Bookings/facility/${facilityId}`);
};


// ============================================================
// GENERAL API ACCESS
// ============================================================

// Export the generic request function.
//
// This can be used later if we need an API endpoint that
// doesn't have a dedicated helper function yet.
export const apiRequest = request;

// ============================================================
// REVIEWS
// ============================================================

// Get all reviews
export const getReviews = () => {
  return request("/Reviews");
};


// Get one review
export const getReview = (id) => {
  return request(`/Reviews/${id}`);
};


// Create a review
//
// Backend:
// POST /api/Reviews
//
// Frontend sends:
// {
//   facilityId,
//   rating,
//   commentText
// }
//
// The memberId comes from the JWT on the backend.
export const createReview = (review) => {
  return request("/Reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
};


// Update a review
//
// A member can update their own review.
// Admin can update any review.
export const updateReview = (id, review) => {
  return request(`/Reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(review),
  });
};


// Delete a review
//
// A member can delete their own review.
// Admin can delete any review.
export const deleteReview = (id) => {
  return request(`/Reviews/${id}`, {
    method: "DELETE",
  });
};